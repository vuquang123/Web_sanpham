# Kho hang (Next.js static export)

Static Next.js site that reads products from Google Sheets at build time, exports to HTML, and is ready for Vercel.

## Tech
- Next.js 14 (App Router, TypeScript)
- Static export (`output: 'export'`) for plain HTML in `out/`
- Google Sheets API (build-time fetch)

## Setup
1) Node 18+ installed.
2) Install deps:
```sh
npm install
```
3) Copy env and fill values (service account recommended):
```sh
cp .env.example .env
# Required: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_SPREADSHEET_ID
# Optional fallback: GOOGLE_SHEETS_API_KEY
# SHEET_RANGE defaults to Kho_Hang!A:O
```
4) Sheet format (first row headers, matching your screenshot):
```
ID Máy | Ngày nhập | Tên sản phẩm | Loại máy | Dung lượng | Pin (%) | Màu sắc | IMEI | Serial | Tình trạng máy | Giá nhập | Giá bán | Ghi chú | Trạng thái | Trạng thái kho
```
Only rows with `Trạng thái` = `Còn hàng` are displayed. Additional columns are ignored unless you extend the parser in `lib/sheets.ts`.

## Run locally
```sh
npm run dev
```
Then open http://localhost:3000.

## Build and export
```sh
npm run build    # writes static export to out/
```
For a static host, serve the `out/` directory. The `export` script is an alias for `build`.

## Deploy to Vercel
- Create a new Vercel project from this repo.
- Set the build command to `npm run build` and the output directory to `out`.
- Add env vars: GOOGLE_SHEETS_API_KEY, SHEET_ID, SHEET_RANGE.
- Every deploy rebuilds and pulls fresh sheet data.

## How data fetching works
- Build-time only (no runtime API). Missing env or fetch errors fall back to sample products.
- Static paths are generated from sheet IDs via `generateStaticParams`.
- To update content, change the sheet, trigger a new build/deploy.

## Extend
- Add new fields to the sheet, update `parseRows` in `lib/sheets.ts`, and render them in the pages.
- For more styling, edit `app/globals.css` or add components.
