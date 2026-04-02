// Shown by the service worker when the user is offline
// and tries to visit a page that isn't cached.

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p
        className="text-sm tracking-[0.3em] uppercase opacity-40 mb-4"
        style={{ fontFamily: "var(--font-body)" }}
      >
        You&apos;re offline
      </p>
      <h1
        className="text-[clamp(3rem,8vw,6rem)] font-bold leading-none tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        No connection
      </h1>
      <p className="mt-6 max-w-sm opacity-40 text-sm leading-relaxed">
        Check your internet connection and try again.
        Some content may still be available from cache.
      </p>
      <a
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm transition-colors hover:bg-white/10"
      >
        Try again
      </a>
    </main>
  );
}
