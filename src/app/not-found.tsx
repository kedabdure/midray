import Link from "next/link";
import { Construction } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-6 py-12">
        <div className="mb-8 flex justify-center">
          <Construction
            className="text-blue-500 dark:text-blue-400"
            size={120}
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          404
        </h1>

        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Coming Soon
        </h2>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          This page is currently under construction. We&apos;re working hard to bring you something amazing!
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
