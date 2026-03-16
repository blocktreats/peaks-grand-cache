"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getTrailsAsGeoJSON, getTrailheadsAsGeoJSON } from "@/data/trails";
import {
  DIFFICULTY_COLORS,
  PASSPORT_TIER_COLORS,
  REGION_BOUNDS,
} from "@/lib/types";

interface MapProps {
  onTrailClick?: (slug: string) => void;
  onTrailHover?: (slug: string | null) => void;
  onBoundsChange?: (bounds: maplibregl.LngLatBounds) => void;
  hoveredTrail?: string | null;
  highlightTrail?: string | null;
  interactive?: boolean;
  className?: string;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "get_a_free_key";

// MapLibre expression: passport peaks get tier color, others get difficulty color
const trailColorExpr: maplibregl.ExpressionSpecification = [
  "case",
  ["==", ["get", "passport_tier"], "bronze"],
  PASSPORT_TIER_COLORS.bronze.accent,
  ["==", ["get", "passport_tier"], "silver"],
  PASSPORT_TIER_COLORS.silver.accent,
  ["==", ["get", "passport_tier"], "gold"],
  PASSPORT_TIER_COLORS.gold.accent,
  // Non-passport: use difficulty color
  [
    "match",
    ["get", "difficulty"],
    "easy", DIFFICULTY_COLORS.easy,
    "moderate", DIFFICULTY_COLORS.moderate,
    "hard", DIFFICULTY_COLORS.hard,
    "expert", DIFFICULTY_COLORS.expert,
    "#3b82f6",
  ],
];

export default function Map({
  onTrailClick,
  onTrailHover,
  onBoundsChange,
  hoveredTrail,
  highlightTrail,
  interactive = true,
  className = "",
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string>("dark");

  const activeSlug = hoveredTrail || highlightTrail || "";

  const layers = [
    { id: "dark", name: "Dark" },
    { id: "topo", name: "Topo" },
    { id: "satellite", name: "Satellite" },
  ];

  const getStyleUrl = useCallback((layerId: string) => {
    switch (layerId) {
      case "topo":
        return `https://api.maptiler.com/maps/topo-v2-dark/style.json?key=${MAPTILER_KEY}`;
      case "satellite":
        return `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`;
      default:
        return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`;
    }
  }, []);

  const addTrailLayers = useCallback(
    (mapInstance: maplibregl.Map) => {
      const trailsGeoJSON = getTrailsAsGeoJSON();
      const trailheadsGeoJSON = getTrailheadsAsGeoJSON();

      if (!mapInstance.getSource("trails")) {
        mapInstance.addSource("trails", {
          type: "geojson",
          data: trailsGeoJSON as GeoJSON.FeatureCollection,
        });
      }

      // Glow layer
      if (!mapInstance.getLayer("trails-glow")) {
        mapInstance.addLayer({
          id: "trails-glow",
          type: "line",
          source: "trails",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": trailColorExpr,
            "line-width": [
              "case",
              ["==", ["get", "slug"], activeSlug], 14,
              8,
            ],
            "line-opacity": [
              "case",
              ["==", ["get", "slug"], activeSlug], 0.35,
              // Passport peaks get a stronger ambient glow
              ["==", ["get", "passport_peak"], true], 0.18,
              0.08,
            ],
            "line-blur": 4,
          },
        });
      }

      // Trail lines
      if (!mapInstance.getLayer("trails-line")) {
        mapInstance.addLayer({
          id: "trails-line",
          type: "line",
          source: "trails",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": trailColorExpr,
            "line-width": [
              "case",
              ["==", ["get", "slug"], activeSlug], 5,
              // Passport peaks slightly thicker
              ["==", ["get", "passport_peak"], true], 3,
              2,
            ],
            "line-opacity": [
              "case",
              ["==", ["get", "slug"], activeSlug], 1,
              0.7,
            ],
          },
        });
      }

      // Trailhead points
      if (!mapInstance.getSource("trailheads")) {
        mapInstance.addSource("trailheads", {
          type: "geojson",
          data: trailheadsGeoJSON as GeoJSON.FeatureCollection,
        });
      }

      if (!mapInstance.getLayer("trailheads-circle")) {
        mapInstance.addLayer({
          id: "trailheads-circle",
          type: "circle",
          source: "trailheads",
          paint: {
            "circle-radius": [
              "case",
              ["==", ["get", "slug"], activeSlug], 9,
              ["==", ["get", "passport_peak"], true], 7,
              4.5,
            ],
            "circle-color": trailColorExpr,
            "circle-stroke-width": [
              "case",
              ["==", ["get", "slug"], activeSlug], 3,
              ["==", ["get", "passport_peak"], true], 2.5,
              1.5,
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "slug"], activeSlug], "#ffffff",
              "#050505",
            ],
          },
        });
      }

      // Labels
      if (!mapInstance.getLayer("trailheads-label")) {
        mapInstance.addLayer({
          id: "trailheads-label",
          type: "symbol",
          source: "trailheads",
          layout: {
            "text-field": ["get", "name"],
            "text-size": [
              "case",
              ["==", ["get", "passport_peak"], true], 13,
              11,
            ],
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-font": ["Open Sans Semibold"],
          },
          paint: {
            "text-color": [
              "case",
              ["==", ["get", "passport_peak"], true], "#ffffff",
              "#c5c5c5",
            ],
            "text-halo-color": "#050505",
            "text-halo-width": 2,
          },
        });
      }

      // Click
      const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
        if (e.features && e.features[0] && onTrailClick) {
          onTrailClick(e.features[0].properties.slug);
        }
      };
      mapInstance.on("click", "trailheads-circle", handleClick);
      mapInstance.on("click", "trails-line", handleClick);

      // Hover
      const handleHoverEnter = (e: maplibregl.MapLayerMouseEvent) => {
        mapInstance.getCanvas().style.cursor = "pointer";
        if (e.features && e.features[0] && onTrailHover) {
          onTrailHover(e.features[0].properties.slug);
        }
      };
      const handleHoverLeave = () => {
        mapInstance.getCanvas().style.cursor = "";
        if (onTrailHover) onTrailHover(null);
      };
      mapInstance.on("mouseenter", "trailheads-circle", handleHoverEnter);
      mapInstance.on("mouseenter", "trails-line", handleHoverEnter);
      mapInstance.on("mouseleave", "trailheads-circle", handleHoverLeave);
      mapInstance.on("mouseleave", "trails-line", handleHoverLeave);

      // Popup
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
      });

      mapInstance.on("mouseenter", "trailheads-circle", (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties;
        const coords = (e.features[0].geometry as GeoJSON.Point)
          .coordinates as [number, number];

        const tierLabel =
          props.passport_tier !== "none"
            ? `<span style="color:${PASSPORT_TIER_COLORS[props.passport_tier as keyof typeof PASSPORT_TIER_COLORS]?.text || "#999"};font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px;">${props.passport_tier} Peak</span> &middot; `
            : "";

        popup
          .setLngLat(coords)
          .setHTML(
            `<div>
              <div style="font-weight:600;margin-bottom:4px;">${props.name}</div>
              <div style="font-size:12px;color:#999;">
                ${tierLabel}${props.distance_km} km &middot; ${props.elevation_gain_m}m gain
              </div>
            </div>`
          )
          .addTo(mapInstance);
      });
      mapInstance.on("mouseleave", "trailheads-circle", () => popup.remove());

      if (onBoundsChange) {
        onBoundsChange(mapInstance.getBounds());
      }
    },
    [activeSlug, onTrailClick, onTrailHover, onBoundsChange]
  );

  // Init
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getStyleUrl("dark"),
      center: [-119.13, REGION_BOUNDS.center[0]],
      zoom: 10,
      minZoom: 8,
      maxZoom: 16,
      attributionControl: {},
      interactive,
    });

    if (interactive) {
      map.current.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        "top-right"
      );
      map.current.addControl(new maplibregl.ScaleControl(), "bottom-left");
    }

    map.current.on("load", () => {
      setLoaded(true);
      if (map.current) addTrailLayers(map.current);
    });

    map.current.on("moveend", () => {
      if (map.current && onBoundsChange) {
        onBoundsChange(map.current.getBounds());
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  // Update highlights on hover/selection change
  useEffect(() => {
    if (!map.current || !loaded) return;
    const m = map.current;

    if (m.getLayer("trails-line")) {
      m.setPaintProperty("trails-line", "line-width", [
        "case",
        ["==", ["get", "slug"], activeSlug], 5,
        ["==", ["get", "passport_peak"], true], 3,
        2,
      ]);
      m.setPaintProperty("trails-line", "line-opacity", [
        "case", ["==", ["get", "slug"], activeSlug], 1, 0.7,
      ]);
    }
    if (m.getLayer("trails-glow")) {
      m.setPaintProperty("trails-glow", "line-width", [
        "case", ["==", ["get", "slug"], activeSlug], 14, 8,
      ]);
      m.setPaintProperty("trails-glow", "line-opacity", [
        "case",
        ["==", ["get", "slug"], activeSlug], 0.35,
        ["==", ["get", "passport_peak"], true], 0.18,
        0.08,
      ]);
    }
    if (m.getLayer("trailheads-circle")) {
      m.setPaintProperty("trailheads-circle", "circle-radius", [
        "case",
        ["==", ["get", "slug"], activeSlug], 9,
        ["==", ["get", "passport_peak"], true], 7,
        4.5,
      ]);
      m.setPaintProperty("trailheads-circle", "circle-stroke-width", [
        "case",
        ["==", ["get", "slug"], activeSlug], 3,
        ["==", ["get", "passport_peak"], true], 2.5,
        1.5,
      ]);
      m.setPaintProperty("trailheads-circle", "circle-stroke-color", [
        "case", ["==", ["get", "slug"], activeSlug], "#ffffff", "#050505",
      ]);
    }
  }, [activeSlug, loaded]);

  // Style switching
  const switchLayer = useCallback(
    (layerId: string) => {
      if (!map.current || layerId === activeLayer) return;
      setActiveLayer(layerId);

      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      const bearing = map.current.getBearing();
      const pitch = map.current.getPitch();

      map.current.setStyle(getStyleUrl(layerId));

      map.current.once("style.load", () => {
        map.current!.setCenter(center);
        map.current!.setZoom(zoom);
        map.current!.setBearing(bearing);
        map.current!.setPitch(pitch);
        addTrailLayers(map.current!);
      });
    },
    [activeLayer, getStyleUrl, addTrailLayers]
  );

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />

      {/* Layer switcher */}
      {interactive && loaded && (
        <div className="absolute top-4 left-4 z-10 flex overflow-hidden rounded-lg border border-white/10 bg-[#111]/90 backdrop-blur-sm">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => switchLayer(layer.id)}
              className={`px-3 py-2 text-xs font-medium transition ${
                activeLayer === layer.id
                  ? "bg-blue-600 text-white"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      {interactive && loaded && (
        <div className="absolute bottom-8 left-4 z-10 rounded-lg border border-white/10 bg-[#111]/90 p-3 backdrop-blur-sm">
          <div className="mb-2 text-xs font-medium text-neutral-400">
            Passport to the Peaks
          </div>
          <div className="space-y-1.5 mb-3">
            {(["bronze", "silver", "gold"] as const).map((tier) => (
              <div key={tier} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: PASSPORT_TIER_COLORS[tier].accent }}
                />
                <span
                  className="text-xs font-medium capitalize"
                  style={{ color: PASSPORT_TIER_COLORS[tier].text }}
                >
                  {tier}
                </span>
              </div>
            ))}
          </div>
          <div className="mb-2 border-t border-white/10 pt-2 text-xs font-medium text-neutral-400">
            Other Trails
          </div>
          <div className="space-y-1.5">
            {(["easy", "moderate", "hard", "expert"] as const).map((d) => (
              <div key={d} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: DIFFICULTY_COLORS[d] }}
                />
                <span className="text-xs capitalize text-neutral-300">{d}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-500" />
        </div>
      )}
    </div>
  );
}
