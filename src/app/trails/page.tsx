"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { trails } from "@/data/trails";
import TrailCard from "@/components/TrailCard";

type DifficultyFilter = "all" | "easy" | "moderate" | "hard" | "expert";
type SortOption = "name" | "distance" | "elevation" | "difficulty";

export default function TrailsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [passportOnly, setPassportOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("name");

  const filtered = useMemo(() => {
    let result = trails.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (difficulty !== "all" && t.difficulty !== difficulty) return false;
      if (passportOnly && !t.passport_peak) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "distance":
          return a.distance_km - b.distance_km;
        case "elevation":
          return b.elevation_gain_m - a.elevation_gain_m;
        case "difficulty": {
          const order = { easy: 0, moderate: 1, hard: 2, expert: 3 };
          return order[a.difficulty] - order[b.difficulty];
        }
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [search, difficulty, passportOnly, sort]);

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
              className="text-sm text-white"
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

      <div className="mx-auto max-w-7xl px-6 pt-28 pb-20">
        <h1 className="mb-2 text-3xl font-bold text-white">All Trails</h1>
        <p className="mb-8 text-neutral-400">
          {trails.length} trails in the Grand Cache region
        </p>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search trails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
          />

          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as DifficultyFilter)
            }
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="name">Sort: Name</option>
            <option value="distance">Sort: Distance</option>
            <option value="elevation">Sort: Elevation</option>
            <option value="difficulty">Sort: Difficulty</option>
          </select>

          <button
            onClick={() => setPassportOnly(!passportOnly)}
            className={`rounded-lg border px-3 py-2 text-sm transition ${
              passportOnly
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-white/10 bg-white/5 text-neutral-400 hover:text-white"
            }`}
          >
            Passport Peaks
          </button>
        </div>

        {/* Results */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trail) => (
            <TrailCard key={trail.slug} trail={trail} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-neutral-500">
            No trails match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
