"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPending, setIsPending] = useState(false);

    // Toast states
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        setToast(null); // Clear previous toasts

        try {
            const response = await fetch("http://localhost:8080/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.jwt);
                
                
                // SUCCESS TOAST
                setToast({ message: "Login successful!", type: "success" });

                // THIS IS THE TRIGGER: It tells the Navbar to check localStorage NOW
                window.dispatchEvent(new Event("auth-change"));

                // Navigate after a delay so they see the toast
                setTimeout(() => {
                    router.push("/");
                }, 1000);
            } else {
                setToast({ message: "Invalid email or password.", type: "error" });
            }
        } catch (error) {
            setToast({ message: "Server connection failed.", type: "error" });
            console.error("Login failed", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-6">
            <div className="bg-[#111] border border-[#222] p-10 w-full max-w-[420px] rounded-[24px] shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-white text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
                    <p className="text-[#888] text-sm">Enter your details to access your workspace.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">

                    {/* TOAST MESSAGE AREA */}
                    {toast && (
                        <div className={`flex items-center gap-3 border p-4 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2 duration-300 ${toast.type === "success"
                                ? "bg-green-500/10 border-green-500/50 text-green-500"
                                : "bg-red-500/10 border-red-500/50 text-red-500"
                            }`}>
                            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <p className="text-xs font-bold uppercase tracking-wider">
                                {toast.message}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold ml-1">Work Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#666] transition-all"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] uppercase tracking-[0.15em] text-[#555] font-bold">Password</label>
                            <button type="button" className="text-[10px] text-[#666] hover:text-white transition-colors">Forgot?</button>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#444] focus:outline-none focus:ring-1 focus:ring-[#666] transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-[#e5e5e5] transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                        {isPending ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-[#666]">
                        New to the platform?{" "}
                        <Link href="/register" className="text-white hover:underline underline-offset-4">Create account</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}