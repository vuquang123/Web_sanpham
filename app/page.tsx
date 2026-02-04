import Link from 'next/link';
import { fetchProducts } from '../lib/sheets';
import { ProductCard } from '../components/ProductCard';

export const dynamic = 'force-static';
export const revalidate = 60; // refresh products roughly every 60s

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <main className="main-shell">
      <header className="header">
        <div>
          <div className="title">Product Catalog</div>
          <p className="subtitle">
            Data comes from Google Sheets and refreshes automatically after a short interval.
          </p>
        </div>
        <Link className="button" href="https://sheets.googleapis.com/" target="_blank" rel="noreferrer">
          Google Sheets API
        </Link>
      </header>

      <section className="grid">
        {products.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Chưa có sản phẩm</h3>
            <p className="muted">
              Kiểm tra quyền truy cập Google Sheets, tên sheet/range (SHEET_RANGE), và giá trị cột "Trạng thái" phải là "Còn hàng".
            </p>
          </div>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        )}
      </section>

      <div className="footer">
        <span className="muted">Need more fields?</span>
        <span className="muted">Add columns in the sheet, extend the parser, rebuild, and redeploy.</span>
      </div>
    </main>
  );
}
