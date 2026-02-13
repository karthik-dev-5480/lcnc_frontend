"use client";

import { printBuildErrors } from "next/dist/build/utils";
import { useState } from "react";

export default function Builder() {
  const [isOpen, setIsOpen] = useState(false);
  const [pageName, setPageName] = useState("");
  const [isPending, setIsPending] = useState(false);
  

  const handleSave = async () => {
    if (!pageName) return alert("Please enter a name");
const token = localStorage.getItem("token");

if (!token) {
    alert("No session found. Please log in again.");
    
     // Make sure to import useRouter
    return;
  }
    setIsPending(true);
    try {
      const response = await fetch("http://localhost:8080/api/pages/create", {
        method: "POST",
        body: JSON.stringify({ name: pageName }),
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
         },
      });

      if (response.ok) {
        alert("Page created successfully!");
        setIsOpen(false);
        setPageName("");
      }
    } catch (error) {
      console.error("Failed to create page", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center p-6">
      <div className="flex flex-col gap-4 w-full max-w-xs">
        
        <button 
          className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest border-2 border-black ring-2 ring-white ring-inset hover:bg-white hover:text-black hover:ring-black transition-all active:scale-95"
          onClick={() => setIsOpen(true)}
        >
          Create Page
        </button>

        <button className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest border-2 border-black ring-2 ring-white ring-inset hover:bg-white hover:text-black hover:ring-black transition-all active:scale-95">
          Create Data source
        </button>

        <button className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest border-2 border-black ring-2 ring-white ring-inset hover:bg-white hover:text-black hover:ring-black transition-all active:scale-95">
          Create Dataset
        </button>

        {isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
            <div className="bg-[#131313] border border-[#333] p-10 w-full max-w-[440px] rounded-[24px] flex flex-col items-center shadow-2xl">
              <h2 className="text-white text-2xl font-semibold tracking-tight mb-2">
                Create page
              </h2>
              <p className="text-[#999] text-sm mb-8 text-center">
                Enter the name for your page you want to create.
              </p>

              <div className="w-full space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Enter page name..."
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-1 focus:ring-[#555] transition-all"
                />

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-[#e5e5e5] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isPending ? "Connecting..." : "Create"}
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2 text-[#666] text-sm font-medium hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#222] w-full text-center">
                <p className="text-[10px] text-[#444] uppercase tracking-[0.2em] font-bold">
                  Enterprise Secure Layer
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-gray-400 uppercase tracking-widest">
        Enterprise System v1.0.2
      </p>
    </main>
  );
}