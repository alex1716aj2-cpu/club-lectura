import Header from "@/components/Header";

export default function LibrosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container">{children}</main>
    </>
  );
}
