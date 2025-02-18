import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold mb-8 text-foreground">
        Welcome to Anime Rating System
      </h1>
      <Link
        href="/login"
        className="px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
