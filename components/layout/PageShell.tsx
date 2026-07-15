import { Sidebar } from "./Sidebar";
import { Toast } from "@/components/tool/ConvertButton";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full flex gap-0"  style={{ alignItems: "flex-start", minHeight: "calc(100vh - 56px)" }}>
        <Sidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5">
          {children}
        </main>
      </div>
      <Toast />
    </>
  );
}
