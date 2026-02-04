import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById, getAllProductIds } from '../../../lib/sheets';

export const dynamic = 'force-static';
export const revalidate = 60; // keep detail pages fresh

export async function generateStaticParams() {
  const ids = await getAllProductIds();
  return ids.map((id) => ({ id }));
}

type Props = {
  params: { id: string };
};

export default async function ProductPage({ params }: Props) {
  const product = await getProductById(params.id);
  if (!product) return notFound();

  const priceLabel =
    typeof product.price === 'number'
      ? `${product.price.toLocaleString('vi-VN')} VND`
      : 'Liên hệ để báo giá';

  const aiReadable = {
    type: product.deviceType || 'Không rõ',
    name: product.name || 'Không rõ',
    variant: product.status || 'Không rõ',
    capacity: product.capacity || 'Không rõ',
    color: product.color || 'Không rõ',
    battery: product.batteryPercent || 'Không rõ',
    condition: product.condition || 'Không rõ',
    price: priceLabel
  };

  return (
    <main className="main-shell">
      <Link className="back-link" href="/">
        ← Back to products
      </Link>

      <div className="detail-shell">
        <div className="badge">{product.deviceType || 'Thông tin máy'}</div>
        <h1 className="title">{product.name}</h1>
        <div className="price">{priceLabel}</div>
        <p className="subtitle">
          Dung lượng: {product.capacity || 'N/A'} · Pin: {product.batteryPercent || 'N/A'} · Màu: {product.color || 'N/A'}
        </p>
        <p className="subtitle">Tình trạng: {product.condition || 'N/A'}</p>
        <p className="muted">Trạng thái: {product.status || 'Không rõ'}</p>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3>Dạng AI hiểu (bắt buộc)</h3>
          <div className="product">
            <p>Loại sản phẩm: {aiReadable.type}</p>
            <p>Tên sản phẩm: {aiReadable.name}</p>
            <p>Phiên bản: {aiReadable.variant}</p>
            <p>Dung lượng: {aiReadable.capacity}</p>
            <p>Màu sắc: {aiReadable.color}</p>
            <p>Pin: {aiReadable.battery}</p>
            <p>Tình trạng máy: {aiReadable.condition}</p>
            <p>Giá bán: {aiReadable.price}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
