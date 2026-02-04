import Link from 'next/link';
import { Product } from '../lib/types';

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const normalize = (value?: string) =>
    (value || '')
      .normalize('NFD')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim();

  const priceLabel =
    typeof product.price === 'number'
      ? `${product.price.toLocaleString('vi-VN')} VNĐ`
      : 'Liên hệ';

  const typeLabel = (() => {
    const raw = normalize(product.name);
    if (raw.includes('ipad')) return 'iPad';
    if (raw.includes('iphone')) return 'iPhone';
    return 'Không rõ';
  })();

  const variantLabel = (() => {
    const raw = normalize(product.deviceType);
    if (raw.includes('lock')) return 'Lock';
    if (raw.includes('quoc') || raw.includes('qt')) return 'Quốc tế';
    return 'Không rõ';
  })();

  const aiReadable = {
    type: typeLabel,
    name: product.name || 'Không rõ',
    variant: variantLabel,
    capacity: product.capacity || 'Không rõ',
    battery: product.batteryPercent || 'Không rõ',
    condition: product.condition || 'Không rõ',
    price: priceLabel
  };
  return (
    <Link href={`/products/${product.id}`} className="card">
        <div data-ai-ignore="true" aria-hidden="true">
          <h3>{product.name}</h3>
          <div className="badge" aria-label="Device type">
            <span>●</span>
            <span>{product.deviceType || 'Không rõ'}</span>
          </div>
          <p className="muted">
            {product.capacity || 'Dung lượng ?'} • {product.color || 'Màu ?'}
          </p>
          <p className="muted">Pin: {product.batteryPercent || 'N/A'} | Tình trạng: {product.condition || 'N/A'}</p>
          <div className="price">{priceLabel}</div>
        </div>

        {/* Khối AI hiển thị rõ ràng để EasyChatAI đọc được */}
      <div className="ai-readable" style={{ marginTop: '0.5rem' }}>
        <p>Loại sản phẩm: {aiReadable.type}</p>
        <p>Tên sản phẩm: {aiReadable.name}</p>
        <p>Phiên bản: {aiReadable.variant}</p>
        <p>Dung lượng: {aiReadable.capacity}</p>
        <p>Pin: {aiReadable.battery}</p>
        <p>Tình trạng máy: {aiReadable.condition}</p>
        <p>Giá bán: {aiReadable.price}</p>
      </div>
    </Link>
  );
}
