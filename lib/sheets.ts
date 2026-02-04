import { GoogleAuth } from 'google-auth-library';
import { Product } from './types';

type SheetResponse = {
  values?: string[][];
};

const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.SHEET_ID;
// If SHEET_RANGE is not provided, fetch the whole "Kho_Hang" sheet (header-based mapping handles column order).
const sheetRange = process.env.SHEET_RANGE || 'Kho_Hang';
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

function normalizeStatus(value?: string) {
  if (!value) return '';
  // Strip diacritics to make matching more tolerant of accents/encoding.
  const ascii = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim();
  return ascii;
}

const IN_STOCK = normalizeStatus('Còn hàng');

function cleanField(value?: string) {
  if (!value) return undefined;
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeHeader(value?: string) {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim();
}

async function getAccessToken(): Promise<string | undefined> {
  if (!clientEmail || !privateKeyRaw) return undefined;
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (typeof token === 'string') return token;
  return token?.token ?? undefined;
}

async function fetchSheetValues(): Promise<string[][] | undefined> {
  if (!spreadsheetId) {
    console.warn('Missing GOOGLE_SHEETS_SPREADSHEET_ID (or SHEET_ID).');
    return undefined;
  }
  const encodedRange = encodeURIComponent(sheetRange);
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;

  const headers: Record<string, string> = {};
  let url = baseUrl;

  const accessToken = await getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (apiKey) {
    url = `${baseUrl}?key=${apiKey}`;
  } else {
    console.warn('Missing credentials: set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY or GOOGLE_SHEETS_API_KEY.');
    return undefined;
  }

  const res = await fetch(url, {
    headers,
    cache: 'force-cache',
    next: { revalidate: 60 }
  });
  if (!res.ok) throw new Error(`Sheets fetch failed: ${res.status}`);
  const json = (await res.json()) as SheetResponse;
  return json.values;
}

function parseRows(rows: string[][]): Product[] {
  // Map by header names (order-independent). Expected headers (normalized):
  // idmay | tensanpham | loaimay | dungluong | pin% | mausac | tinhtrangmay | giaban | trangthai
  const [header = [], ...data] = rows;

  const headerMap: Record<string, number> = {};
  header.forEach((name, idx) => {
    headerMap[normalizeHeader(name)] = idx;
  });

  const colId = headerMap['idmay'];
  const colName = headerMap['tensanpham'];
  const colDeviceType = headerMap['loaimay'];
  const colCapacity = headerMap['dungluong'];
  const colBattery = headerMap['pin%'] ?? headerMap['pin(%)'] ?? headerMap['pin'];
  const colColor = headerMap['mausac'];
  const colCondition = headerMap['tinhtrangmay'];
  const colPrice = headerMap['giaban'];
  const colStatus = headerMap['trangthai'];

  const requiredPresent = colId !== undefined && colName !== undefined && colStatus !== undefined;
  if (!requiredPresent) {
    console.warn('Required headers not found: cần ID Máy, Tên sản phẩm, Trạng thái.');
    return [];
  }

  const pick = (row: string[], idx: number | undefined) => (idx === undefined ? undefined : row[idx]);

  return data
    .map((row) => {
      const idRaw = pick(row, colId);
      const nameRaw = pick(row, colName);
      if (!idRaw || !nameRaw) return null;

      const statusRaw = pick(row, colStatus);
      const statusNormalized = normalizeStatus(statusRaw);
      if (statusNormalized !== IN_STOCK) return null;

      const priceRaw = pick(row, colPrice);
      const numericPrice = priceRaw
        ? (() => {
            const digitsOnly = String(priceRaw).replace(/[^0-9]/g, '');
            return digitsOnly ? Number(digitsOnly) : undefined;
          })()
        : undefined;

      return {
        id: cleanField(idRaw) || '',
        name: cleanField(nameRaw) || '',
        deviceType: cleanField(pick(row, colDeviceType)),
        capacity: cleanField(pick(row, colCapacity)),
        batteryPercent: cleanField(pick(row, colBattery)),
        color: cleanField(pick(row, colColor)),
        condition: cleanField(pick(row, colCondition)),
        price: Number.isFinite(numericPrice) ? numericPrice : undefined,
        status: cleanField(statusRaw)
      } satisfies Product;
    })
    .filter(Boolean) as Product[];
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const values = await fetchSheetValues();
    if (!values?.length) {
      console.warn('No rows returned from sheet. Check sheet name/range and sharing.');
      return [];
    }
    const parsed = parseRows(values);
    if (!parsed.length) {
      console.warn('Rows fetched but none matched status "Còn hàng" or required columns.');
    }
    return parsed;
  } catch (err) {
    console.error('Error fetching sheet data.', err);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await fetchProducts();
  return products.find((p) => p.id === id);
}

export async function getAllProductIds(): Promise<string[]> {
  const products = await fetchProducts();
  return products.map((p) => p.id);
}
