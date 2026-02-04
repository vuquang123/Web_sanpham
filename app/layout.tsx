import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kho hàng iPhone Lock và Quốc tế',
  description: 'Kho hang của cửa hàng gồm các mẫu iPhone Lock và iPhone Quốc tế đang có trong kho. Thông tin bao gồm id máy, tên sản phẩm, loại máy, dung lượng, pin, tình trạng và giá bán.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
