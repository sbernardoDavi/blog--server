import Navbar from "./navbar/Navbar";
import Footer from "./footer/footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <Navbar />
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}
