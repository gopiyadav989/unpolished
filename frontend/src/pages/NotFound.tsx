import { Link } from "react-router-dom";
import { Header } from "../components/Header";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center text-center text-gray-800 px-4">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Oops! The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-black text-white font-medium"
        >
          Go back home
        </Link>
      </main>
    </div>
  );
}
