"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { trails } from "@/data/trails";
import { DIFFICULTY_COLORS } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const router = useRouter();
  const [selectedTrail, setSelectedTrail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selected = trails.find((t) => t.slug === selectedTrail);

  return (
    <div className="flex h-screen bg-[#050505]">
      {/* Sidebar */}
      <div
        className={`relative z-20 flex flex-col border-r border-white/5 bg-[#0a0a0a] transition-all duration-300 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 px-4">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="22"
              height="22"
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
            <span className="text-sm font-semibold text-white">Peaks</span>
          </Link>
        </div>

        {/* Trail list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
            {trails.length} Trails
          </div>
          <div className="space-y-1">
            {trails.map((trail) => (
              <button
                key={trail.slug}
                onClick={() => setSelectedTrail(trail.slug)}
                className={`w-full rounded-lg p-3 text-left transition ${
                  selectedTrail === trail.slug
                    ? "bg-white/10 text-white"
                    : "text-neutral-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: DIFFICULTY_COLORS[trail.difficulty],
                    }}
                  />
                  <span className="text-sm font-medium">{trail.name}</span>
                  {trail.passport_peak && (
                    <span className="ml-auto text-[10px] text-amber-500">
                      PP
                    </span>
                  )}
                </div>
                <div className="mt-1 pl-4 text-xs text-neutral-500">
                  {trail.distance_km} km &middot; {trail.elevation_gain_m}m gain
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected trail detail */}
        {selected && (
          <div className="shrink-0 border-t border-white/5 p-4">
            <h3 className="mb-1 font-semibold text-white">{selected.name}</h3>
            <div className="mb-3 text-sm text-neutral-500">
              {selected.distance_km} km &middot; {selected.elevation_gain_m}m
              &middot; ~{selected.estimated_hours}h
            </div>
            <Link
              href={`/trails/${selected.slug}`}
              className="block w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-500"
            >
              View Details
            </Link>
          </div>
        )}
      </div>

      {/* Toggle sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-[calc(theme(spacing.80)-1px)] top-3 z-30 rounded-r-lg border border-l-0 border-white/10 bg-[#0a0a0a] p-2 text-neutral-400 transition hover:text-white"
        style={{ left: sidebarOpen ? "calc(20rem - 1px)" : "0" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition ${sidebarOpen ? "" : "rotate-180"}`}
        >
          <path
            d="M10 4L6 8l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Map */}
      <div className="flex-1">
        <Map
          onTrailClick={(slug) => {
            setSelectedTrail(slug);
            router.push(`/trails/${slug}`);
          }}
          highlightTrail={selectedTrail}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
