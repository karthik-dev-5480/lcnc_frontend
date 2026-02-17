"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PageData {
  id: number;
  name: string;
  backgroundColor: string;
}

export default function PagesManager() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const router = useRouter();

  // Helper to get token
  const getAuthHeader = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });

  // 1. FETCH ALL PAGES (You'll need a /all endpoint in your controller eventually)
  const loadPages = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/pages/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPages(data); // This fills your grid
            }
        } catch (error) {
            console.error("Grid load failed", error);
        }
    }, []);

    // Load grid on mount
    useEffect(() => {
        loadPages();
    }, [loadPages]);

  useEffect(() => {
    // Check if logged in, otherwise redirect
    if (!localStorage.getItem("token")) {
        router.push("/login");
        return;
    }
    // fetchPages(); // Uncomment once you have a GET /all endpoint
  }, []);

  // 2. CREATE PAGE
 const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch("http://localhost:8080/api/pages/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ 
                    name: newPageTitle, 
                    backgroundColor: "#0a0a0a" 
                }),
            });

            if (response.ok) {
                setNewPageTitle("");
                // REFRESH THE GRID: Call the load function again
                await loadPages(); 
                setToast({ message: "Created!", type: "success" });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will delete all widgets on this page.")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/pages/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (response.ok) {
            setToast({ message: "Page deleted successfully", type: "success" });
            // Update local state to remove the row
            setPages(pages.filter(p => p.id !== id));
        } else {
            setToast({ message: "Failed to delete page", type: "error" });
        }
    } catch (error) {
        setToast({ message: "Server error", type: "error" });
    }
};

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0a0a0a] p-8">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* CREATE SECTION */}
        <div className="bg-[#111] border border-[#222] p-8 rounded-[24px] shadow-2xl">
          <div className="mb-6">
            <h1 className="text-white text-2xl font-bold tracking-tight">Your Workspace</h1>
            <p className="text-[#888] text-sm">Create a new page to start designing.</p>
          </div>

          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              placeholder="Page Name (e.g., Dashboard)"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#666] transition-all"
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-6 bg-white text-black font-bold rounded-xl hover:bg-[#e5e5e5] transition-all active:scale-[0.95] disabled:opacity-50"
            >
              {isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Create
            </button>
          </form>
        </div>

        {/* TOAST MESSAGE */}
        {toast && (
          <div className={`flex items-center gap-3 border p-4 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300 ${
            toast.type === "success" ? "bg-green-500/10 border-green-500/50 text-green-500" : "bg-red-500/10 border-red-500/50 text-red-500"
          }`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <p className="text-xs font-bold uppercase tracking-wider">{toast.message}</p>
          </div>
        )}

        {/* DATA GRID */}
        <div className="bg-[#111] border border-[#222] rounded-[24px] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#161616]">
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold">Page Name</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {pages.length > 0 ? pages.map((page) => (
                <tr key={page.id} className="group hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#222] rounded-lg text-[#888] group-hover:text-white transition-colors">
                        <FileText size={20} />
                      </div>
                      <span className="text-white font-medium">{page.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-[#555] hover:text-white hover:bg-[#333] rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(page.id)}
                      className="p-2 text-[#555] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="p-20 text-center text-[#444] italic text-sm">
                    No pages found. Start by creating one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}