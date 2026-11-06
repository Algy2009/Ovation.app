import "./globals.css";
import SessionProviderClient from "@/components/SessionProviderClient";
import { DataProvider } from "@/lib/store";

export const metadata = {
  title: "Ovation — Tiket Konser",
  description: "Cari, pesan, dan kelola tiket konser dari satu tempat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <SessionProviderClient>
          <DataProvider>{children}</DataProvider>
        </SessionProviderClient>
      </body>
    </html>
  );
}
