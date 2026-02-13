"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react"; // Nice success icon

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPending, setIsPending] = useState(false);
  
  // State for the toast message
  const [showToast, setShowToast] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const response = await fetch("http://localhost:8080/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 1. Show the success toast
        setShowToast(true);

        // 2. Hide toast and redirect after a short delay
        setTimeout(() => {
          setShowToast(false);
          // dispatch event if you want navbar to update immediately
          window.dispatchEvent(new Event("auth-change"));
          router.push("/login");
        }, 3000);

      } else {
        alert("Signup failed. Please check your details.");
      }
    } catch (error) {
      console.error("Signup error", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-5">
      <div className="bg-[#111] border border-[#222] p-10 w-full max-w-[420px] rounded-[24px] shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Get Started</h1>
          <p className="text-[#888] text-sm">Create your enterprise account in seconds.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* TOAST MESSAGE: Positioned above First Name */}
          {showToast && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-500 flex items-center gap-3 bg-green-500/10 border border-green-500/50 p-4 rounded-xl mb-4">
              <CheckCircle2 className="text-green-500" size={18} />
              <p className="text-green-500 text-xs font-bold uppercase tracking-wider">
                Signup Success. Please check your email to activate your account.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold ml-1">First Name</label>
            <input
              type="text"
              required
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#666] transition-all"
              placeholder="John"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold ml-1">Last Name</label>
            <input
              type="text"
              required
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#666] transition-all"
              placeholder="Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold ml-1">Work Email</label>
            <input
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#666] transition-all"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold ml-1">Password</label>
            <input
              type="password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#666] transition-all"
              placeholder="Minimum 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-[#e5e5e5] transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {isPending ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#666]">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline underline-offset-4">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}