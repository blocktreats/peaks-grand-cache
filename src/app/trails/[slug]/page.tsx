"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getTrailBySlug, trails } from "@/data/trails";
import { DIFFICULTY_COLORS } from "@/lib/types";
import { downloadGPX } from "@/lib/gpx";

const ElevationProfile = dynamic(
  () => import("@/components/ElevationProfile"),
  { ssr: false }
);
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TrailPage() {
  const params = useParams();
  const trail = getTrailBySlug(params.slug as string);

  if (!trail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-neutral-400">
        Trail not found.{" "}
        <Link href="/trails" className="ml-2 text-blue-400 hover:underline">
          Back to trails
        </Link>
      </div>
    );
  }

  const relatedTrails = trails
    .filter((t) => t.slug !== trail.slug)
    .filter(
      (t) =>
        t.difficulty === trail.difficulty ||
        t.tags.some((tag) => trail.tags.includes(tag))
    )
    .slice(0, 3);

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
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Map hero */}
        <div className="relative h-[400px] w-full">
          <Map
            highlightTrail={trail.slug}
            interactive={false}
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="mx-auto max-w-4xl px-6 -mt-20 relative z-10">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/trails" className="hover:text-white transition">
              Trails
            </Link>
            <span>/</span>
            <span className="text-neutral-300">{trail.name}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            {trail.passport_peak && trail.passport_tier && (
              <span
                className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                  trail.passport_tier === "bronze"
                    ? "bg-amber-500/10 text-amber-400"
                    : trail.passport_tier === "silver"
                      ? "bg-neutral-400/10 text-neutral-300"
                      : "bg-yellow-500/10 text-yellow-400"
                }`}
              >
                Passport to the Peaks &mdash; {trail.passport_tier}
              </span>
            )}
            <h1 className="mb-3 text-4xl font-bold text-white">{trail.name}</h1>
            <p className="text-lg text-neutral-400">{trail.description}</p>
          </div>

          {/* Stats grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-white/5 bg-[#111] p-4">
              <div className="mb-1 text-sm text-neutral-500">Distance</div>
              <div className="text-xl font-semibold text-white">
                {trail.distance_km} km
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#111] p-4">
              <div className="mb-1 text-sm text-neutral-500">Elevation Gain</div>
              <div className="text-xl font-semibold text-white">
                {trail.elevation_gain_m}m
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#111] p-4">
              <div className="mb-1 text-sm text-neutral-500">High Point</div>
              <div className="text-xl font-semibold text-white">
                {trail.elevation_high_m}m
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#111] p-4">
              <div className="mb-1 text-sm text-neutral-500">Est. Time</div>
              <div className="text-xl font-semibold text-white">
                {trail.estimated_hours}h
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#111] p-4">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: DIFFICULTY_COLORS[trail.difficulty],
                }}
              />
              <div>
                <div className="text-sm text-neutral-500">Difficulty</div>
                <div className="font-medium capitalize text-white">
                  {trail.difficulty}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#111] p-4">
              <div className="text-sm text-neutral-500">Type</div>
              <div className="font-medium capitalize text-white">
                {trail.type}
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-[#111] p-4">
              <div className="text-sm text-neutral-500">Season</div>
              <div className="font-medium text-white">{trail.season}</div>
            </div>
          </div>

          {/* Elevation Profile */}
          <div className="mb-8 rounded-2xl border border-white/5 bg-[#111] p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Elevation Profile
            </h2>
            <ElevationProfile
              elevations={trail.elevation_profile}
              distance_km={trail.distance_km}
            />
          </div>

          {/* Trailhead & Actions */}
          <div className="mb-8 flex flex-wrap gap-4">
            <button
              onClick={() => downloadGPX(trail)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download GPX
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${trail.trailhead[1]},${trail.trailhead[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Get Directions
            </a>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-neutral-400">
              Trailhead: {trail.trailhead[1].toFixed(4)}°N,{" "}
              {Math.abs(trail.trailhead[0]).toFixed(4)}°W
            </div>
          </div>

          {/* Tags */}
          <div className="mb-12 flex flex-wrap gap-2">
            {trail.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Related trails */}
          {relatedTrails.length > 0 && (
            <div className="mb-20">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Similar Trails
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedTrails.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/trails/${t.slug}`}
                    className="group rounded-xl border border-white/5 bg-[#111] p-4 transition hover:border-white/10"
                  >
                    <h3 className="mb-1 font-medium text-white transition group-hover:text-blue-400">
                      {t.name}
                    </h3>
                    <div className="text-sm text-neutral-500">
                      {t.distance_km} km &middot; {t.elevation_gain_m}m gain
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
