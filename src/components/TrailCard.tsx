import Link from "next/link";
import { Trail, DIFFICULTY_COLORS, PASSPORT_TIER_COLORS } from "@/lib/types";

interface TrailCardProps {
  trail: Trail;
  compact?: boolean;
}

export default function TrailCard({ trail, compact = false }: TrailCardProps) {
  const dotColor =
    trail.passport_peak && trail.passport_tier
      ? PASSPORT_TIER_COLORS[trail.passport_tier].accent
      : DIFFICULTY_COLORS[trail.difficulty];

  return (
    <Link
      href={`/trails/${trail.slug}`}
      className="group block rounded-2xl border border-white/5 bg-[#111] p-5 transition hover:border-white/10 hover:bg-[#161616]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {trail.passport_peak && trail.passport_tier && (
            <span
              className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `${PASSPORT_TIER_COLORS[trail.passport_tier].accent}18`,
                color: PASSPORT_TIER_COLORS[trail.passport_tier].text,
              }}
            >
              {trail.passport_tier} peak
            </span>
          )}
          <h3 className="mb-1 font-semibold text-white transition group-hover:text-blue-400">
            {trail.name}
          </h3>
          {!compact && (
            <p className="mb-3 line-clamp-2 text-sm text-neutral-500">
              {trail.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <span className="capitalize">{trail.difficulty}</span>
        </div>
        <span>{trail.distance_km} km</span>
        <span>{trail.elevation_gain_m}m gain</span>
        <span>~{trail.estimated_hours}h</span>
        <span className="capitalize text-neutral-600">{trail.type}</span>
      </div>
    </Link>
  );
}
