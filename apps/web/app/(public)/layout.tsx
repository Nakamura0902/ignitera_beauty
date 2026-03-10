import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareBar } from "@/components/compare/CompareBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-24">{children}</main>
      <Footer />
      <CompareBar />
    </>
  );
}
