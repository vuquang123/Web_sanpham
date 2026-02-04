import Link from 'next/link';
import { Product } from '../lib/types';

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const priceLabel =
    typeof product.price === 'number'
      ? `${product.price.toLocaleString('vi-VN')} đ`
      : 'Liên hệ';
  return (
    <Link href={`/products/${product.id}`} className="card">
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
    </Link>
  );
}
