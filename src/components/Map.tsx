"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getTrailsAsGeoJSON, getTrailheadsAsGeoJSON } from "@/data/trails";
import { DIFFICULTY_COLORS, REGION_BOUNDS } from "@/lib/types";

interface MapProps {
  onTrailClick?: (slug: string) => void;
  highlightTrail?: string | null;
  interactive?: boolean;
  className?: string;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "get_a_free_key";

export default function Map({
  onTrailClick,
  highlightTrail,
  interactive = true,
  className = "",
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string>("dark");

  const layers = [
    { id: "dark", name: "Dark", icon: "M" },
    { id: "topo", name: "Topo", icon: "T" },
    { id: "satellite", name: "Satellite", icon: "S" },
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

      // Trail lines
      if (!mapInstance.getSource("trails")) {
        mapInstance.addSource("trails", {
          type: "geojson",
          data: trailsGeoJSON as GeoJSON.FeatureCollection,
        });
      }

      if (!mapInstance.getLayer("trails-line")) {
        mapInstance.addLayer({
          id: "trails-line",
          type: "line",
          source: "trails",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": [
              "match",
              ["get", "difficulty"],
              "easy",
              DIFFICULTY_COLORS.easy,
              "moderate",
              DIFFICULTY_COLORS.moderate,
              "hard",
              DIFFICULTY_COLORS.hard,
              "expert",
              DIFFICULTY_COLORS.expert,
              "#3b82f6",
            ],
            "line-width": [
              "case",
              ["==", ["get", "slug"], highlightTrail || ""],
              5,
              3,
            ],
            "line-opacity": [
              "case",
              ["==", ["get", "slug"], highlightTrail || ""],
              1,
              0.7,
            ],
          },
        });
      }

      // Trail glow effect
      if (!mapInstance.getLayer("trails-glow")) {
        mapInstance.addLayer(
          {
            id: "trails-glow",
            type: "line",
            source: "trails",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": [
                "match",
                ["get", "difficulty"],
                "easy",
                DIFFICULTY_COLORS.easy,
                "moderate",
                DIFFICULTY_COLORS.moderate,
                "hard",
                DIFFICULTY_COLORS.hard,
                "expert",
                DIFFICULTY_COLORS.expert,
                "#3b82f6",
              ],
              "line-width": 8,
              "line-opacity": 0.15,
              "line-blur": 4,
            },
          },
          "trails-line"
        );
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
              ["==", ["get", "passport_peak"], true],
              7,
              5,
            ],
            "circle-color": [
              "match",
              ["get", "difficulty"],
              "easy",
              DIFFICULTY_COLORS.easy,
              "moderate",
              DIFFICULTY_COLORS.moderate,
              "hard",
              DIFFICULTY_COLORS.hard,
              "expert",
              DIFFICULTY_COLORS.expert,
              "#3b82f6",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#050505",
          },
        });
      }

      // Trailhead labels
      if (!mapInstance.getLayer("trailheads-label")) {
        mapInstance.addLayer({
          id: "trailheads-label",
          type: "symbol",
          source: "trailheads",
          layout: {
            "text-field": ["get", "name"],
            "text-size": 12,
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-font": ["Open Sans Semibold"],
          },
          paint: {
            "text-color": "#e5e5e5",
            "text-halo-color": "#050505",
            "text-halo-width": 2,
          },
        });
      }

      // Click handlers
      mapInstance.on("click", "trailheads-circle", (e) => {
        if (e.features && e.features[0] && onTrailClick) {
          onTrailClick(e.features[0].properties.slug);
        }
      });

      mapInstance.on("mouseenter", "trailheads-circle", () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });

      mapInstance.on("mouseleave", "trailheads-circle", () => {
        mapInstance.getCanvas().style.cursor = "";
      });

      // Popup on hover
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

        popup
          .setLngLat(coords)
          .setHTML(
            `<div>
              <div style="font-weight:600;margin-bottom:4px;">${props.name}</div>
              <div style="font-size:12px;color:#999;">
                ${props.distance_km} km &middot; ${props.elevation_gain_m}m gain
                ${props.passport_peak ? ` &middot; <span style="color:#f59e0b;">Passport Peak</span>` : ""}
              </div>
            </div>`
          )
          .addTo(mapInstance);
      });

      mapInstance.on("mouseleave", "trailheads-circle", () => {
        popup.remove();
      });
    },
    [highlightTrail, onTrailClick]
  );

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
      if (map.current) {
        addTrailLayers(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [interactive, getStyleUrl, addTrailLayers]);

  // Handle style switching
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

  // Fly to highlighted trail
  useEffect(() => {
    if (!map.current || !loaded || !highlightTrail) return;

    const source = map.current.getSource("trails") as maplibregl.GeoJSONSource;
    if (!source) return;

    // Update the line width expression
    if (map.current.getLayer("trails-line")) {
      map.current.setPaintProperty("trails-line", "line-width", [
        "case",
        ["==", ["get", "slug"], highlightTrail],
        5,
        3,
      ]);
      map.current.setPaintProperty("trails-line", "line-opacity", [
        "case",
        ["==", ["get", "slug"], highlightTrail],
        1,
        0.7,
      ]);
    }
  }, [highlightTrail, loaded]);

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
            Difficulty
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
