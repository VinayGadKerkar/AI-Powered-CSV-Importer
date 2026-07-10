import Sidebar from "@/components/Sidebar";
import LeadSourcesPage from "@/components/LeadSourcesPage";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <LeadSourcesPage />
      </main>
    </div>
  );
}
