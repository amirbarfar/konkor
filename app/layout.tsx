import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "آزمون کنکور",
  description: "سایت آزمون‌های شبیه‌ساز کنکور با انیمیشن‌های زیبا و نمایش نتایج نهایی",
  keywords: "کنکور, آزمون, شبیه‌ساز, ریاضی, تجربی, انسانی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
