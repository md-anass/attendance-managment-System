import Sidebar from "./Sidebar";
import Header from "./Header";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-slate-100 min-h-screen text-black">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;


