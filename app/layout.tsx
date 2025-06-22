import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KuanimTungpichaiOnline",
  description: "กวนอิมทุ่งพิชัยออนไลน์",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex justify-center items-center">
        <div
          className="
      w-full max-w-[425px]
      bg-[url('/1.png')] 
        bg-cover 
        bg-bottom 
        bg-no-repeat
        h-screen
    "
        >
          <div className="h-16 w-full max-w-[425px] text-white fixed flex justify-center items-center bg-red-950">
            <h1 className="text-3xl text-center">กวนอิมทุ่งพิชัยออนไลน์</h1>
          </div>
          <div className="w-full max-w-[375px] max-h-screen overflow-hidden mx-auto flex flex-col justify-center items-center">
            {children}
            <div className="fixed bottom-0 w-full max-w-[425px] h-16 rounded-t-2xl flex justify-between items-center bg-red-950 text-white">
              <Link href={"/"} className="w-full text-center text-2xl">
                หน้าหลัก
              </Link>
              <Link href={"/status"} className="w-full text-center text-2xl">
                สถานะกองบุญ
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
