import Link from "next/link";
import { trails } from "@/data/trails";

export default function Home() {
  const passportPeaks = trails.filter((t) => t.passport_peak);
  const featuredTrails = trails.filter((t) => !t.passport_peak).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              className="text-blue-500"
            >
              <path
                d="M14 2L2 26h24L14 2z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path d="M14 8L8 22h12L14 8z" fill="currentColor" opacity="0.2" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-white">
              Peaks
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/trails"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              Trails
            </Link>
            <Link
              href="/map"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              Map
            </Link>
            <Link
              href="/map"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Explore Map
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16">
        {/* Gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-[#050505] to-[#050505]" />
          <div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {trails.length} trails in the Grand Cache region
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
            Every peak.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              One map.
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-400">
            Explore the trails of Grand Cache, Alberta. From the Passport to the
            Peaks summits to riverside walks — plan your next adventure with
            detailed maps, elevation profiles, and downloadable GPX tracks.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/map"
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Open Map
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition group-hover:translate-x-0.5"
              >
                <path
                  d="M3 8h10m0 0L9 4m4 4L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/trails"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
            >
              Browse Trails
            </Link>
          </div>
        </div>
      </section>

      {/* Passport to the Peaks */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-sm font-medium uppercase tracking-wider text-blue-400">
              Passport to the Peaks
            </span>
            <h2 className="text-3xl font-bold text-white">Summit Challenges</h2>
            <p className="mt-2 text-neutral-400">
              The legendary 21-peak challenge of Grand Cache
            </p>
          </div>
          <Link
            href="/trails?filter=passport"
            className="text-sm text-neutral-400 transition hover:text-white"
          >
            View all peaks &rarr;
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {passportPeaks.map((trail) => (
            <Link
              key={trail.slug}
              href={`/trails/${trail.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#111] p-6 transition hover:border-white/10 hover:bg-[#161616]"
            >
              {trail.passport_tier && (
                <span
                  className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${
                    trail.passport_tier === "bronze"
                      ? "bg-amber-500/10 text-amber-400"
                      : trail.passport_tier === "silver"
                        ? "bg-neutral-400/10 text-neutral-300"
                        : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {trail.passport_tier}
                </span>
              )}
              <h3 className="mb-2 text-lg font-semibold text-white transition group-hover:text-blue-400">
                {trail.name}
              </h3>
              <div className="mb-3 flex items-center gap-4 text-sm text-neutral-500">
                <span>{trail.distance_km} km</span>
                <span>{trail.elevation_gain_m}m gain</span>
                <span>{trail.elevation_high_m}m summit</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    trail.difficulty === "easy"
                      ? "bg-emerald-400"
                      : trail.difficulty === "moderate"
                        ? "bg-blue-400"
                        : trail.difficulty === "hard"
                          ? "bg-amber-400"
                          : "bg-red-400"
                  }`}
                />
                <span className="text-sm capitalize text-neutral-400">
                  {trail.difficulty}
                </span>
              </div>
              <div className="absolute top-6 right-6 text-neutral-600 transition group-hover:text-neutral-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M5 15L15 5m0 0H8m7 0v7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* More Trails */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">More Trails</h2>
            <p className="mt-2 text-neutral-400">
              Waterfalls, canyons, and riverside walks
            </p>
          </div>
          <Link
            href="/trails"
            className="text-sm text-neutral-400 transition hover:text-white"
          >
            View all trails &rarr;
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTrails.map((trail) => (
            <Link
              key={trail.slug}
              href={`/trails/${trail.slug}`}
              className="group rounded-2xl border border-white/5 bg-[#111] p-5 transition hover:border-white/10 hover:bg-[#161616]"
            >
              <h3 className="mb-2 font-semibold text-white transition group-hover:text-blue-400">
                {trail.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-neutral-500">
                <span>{trail.distance_km} km</span>
                <span>{trail.elevation_gain_m}m</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-neutral-600">
          <p>
            Peaks — Grand Cache Trail Explorer. Trail data sourced from Alberta
            Open Data, OpenStreetMap, and community contributions.
          </p>
        </div>
      </footer>
    </div>
  );
}
