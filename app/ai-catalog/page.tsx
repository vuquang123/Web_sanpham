import Link from 'next/link';
import { fetchProducts } from '../../lib/sheets';

export const dynamic = 'force-static';
export const revalidate = 300; // giữ dữ liệu tĩnh để AI crawler đọc

export default async function AICatalogPage() {
  const products = await fetchProducts();

  return (
    <main className="main-shell">
      <header className="header">
        <div>
          <div className="title">Danh sách sản phẩm (dạng AI đọc)</div>
          <p className="subtitle">
            Trang tóm tắt text thuần để chatbot/AI (ví dụ EasyChatAI) đọc nhanh. Mỗi sản phẩm hiển thị một block duy nhất với nhãn tiếng Việt rõ ràng.
          </p>
          <p className="muted">
            <Link href="/">← Quay về trang chính</Link>
          </p>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="card">
          <h3>Chưa có sản phẩm</h3>
          <p className="muted">Không tải được dữ liệu từ Google Sheets hoặc kho đang trống.</p>
        </div>
      ) : (
        <section className="grid">
          {products.map((p) => (
            <div key={p.id} className="card">
              <h3>{p.name}</h3>
              <div className="product">
                <p>Loại sản phẩm: {p.name?.toLowerCase().includes('ipad') ? 'iPad' : p.name?.toLowerCase().includes('iphone') ? 'iPhone' : 'Không rõ'}</p>
                <p>Tên sản phẩm: {p.name || 'Không rõ'}</p>
                <p>Phiên bản: {(() => {
                  const normalized = (p.deviceType || '')
                    .normalize('NFD')
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .toLowerCase()
                    .trim();
                  if (normalized.includes('lock')) return 'Lock';
                  if (normalized.includes('quoc') || normalized.includes('qt')) return 'Quốc tế';
                  return 'Không rõ';
                })()}</p>
                <p>Dung lượng: {p.capacity || 'Không rõ'}</p>
                <p>Pin: {p.batteryPercent || 'Không rõ'}</p>
                <p>Tình trạng máy: {p.condition || 'Không rõ'}</p>
                <p>Giá bán: {typeof p.price === 'number' ? `${p.price.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
