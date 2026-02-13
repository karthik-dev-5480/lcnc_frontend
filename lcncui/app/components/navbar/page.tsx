"use client";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        // Check immediately on load
        checkToken();

        // Listen for the custom event from the Login/Logout actions
        window.addEventListener("auth-change", checkToken);

        return () => window.removeEventListener("auth-change", checkToken);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);

        // Notify any other components that auth state changed
        window.dispatchEvent(new Event("auth-change"));

        router.push("/login");
    };

    return (
        <nav className="flex items-center justify-between px-8 py-4 border-b border-[#333] bg-black text-white">
            <Link href="/" className="text-xl font-black tracking-tighter">CORE.LOGIC</Link>

            <div className="flex items-center gap-8 font-bold uppercase tracking-widest text-xs">
                <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
                <Link href="/about" className="hover:text-gray-400 transition-colors">About</Link>

                {/* User Dropdown */}
                <div className="group relative cursor-pointer">
                    {/* Avatar Icon - Border changed to white for visibility */}
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-90">
                        <User size={20} strokeWidth={2.5} />
                    </div>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                        <div className="w-48 bg-[#131313] border border-[#333] shadow-2xl rounded-xl overflow-hidden">
                            {!isLoggedIn ? (
                                <button
                                    onClick={() => router.push("/login")}
                                    className="w-full text-center py-4 bg-transparent text-white font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-white hover:text-black"
                                >
                                    Login
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => router.push("/profile")}
                                        className="w-full text-center py-4 bg-transparent text-white font-bold uppercase tracking-widest text-[10px] border-b border-[#333] transition-all hover:bg-white hover:text-black"
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-center py-4 bg-transparent text-red-500 font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-red-500 hover:text-white"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}