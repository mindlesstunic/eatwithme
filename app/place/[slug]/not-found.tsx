import Link from "next/link";

export default function NotFound() {
  return (
    <main className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Place Not Found</h1>
      <p className="text-gray-500 mb-6">We couldn't find this place.</p>
      <Link href="/" className="text-blue-600 hover:underline">
        ← Back to discovery
      </Link>
    </main>
  );
}
