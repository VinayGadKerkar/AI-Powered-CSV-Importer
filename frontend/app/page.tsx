"use client";

import { useState } from "react";
import Sidebar, { NavPage } from "@/components/Sidebar";
import LeadSourcesPage from "@/components/LeadSourcesPage";

function ComingSoon({ page }: { page: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center text-3xl mb-4">
        🚧
      </div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{page}</h2>
      <p className="text-gray-500 text-sm">This section is coming soon.</p>
    </div>
  );
}

export default function Home() {
  const [activePage, setActivePage] = useState<NavPage>("Lead Sources");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 overflow-auto">
        {activePage === "Lead Sources" ? (
          <LeadSourcesPage />
        ) : (
          <ComingSoon page={activePage} />
        )}
      </main>
    </div>
  );
}
