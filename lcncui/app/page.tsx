import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Welcome to Enterprise System</h1>
      <Link 
        href="/builder" 
        className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Go to Build Dashboard
      </Link>
    </main>
  );
}