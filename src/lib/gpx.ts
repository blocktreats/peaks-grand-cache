import { Trail } from "./types";

export function generateGPX(trail: Trail): string {
  const points = trail.coordinates
    .map((coord, i) => {
      const ele = trail.elevation_profile[i] || trail.elevation_profile[trail.elevation_profile.length - 1];
      return `      <trkpt lat="${coord[1]}" lon="${coord[0]}"><ele>${ele}</ele></trkpt>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Peaks - Grand Cache Trail Explorer"
  xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${trail.name}</name>
    <desc>${trail.description}</desc>
  </metadata>
  <trk>
    <name>${trail.name}</name>
    <type>${trail.difficulty}</type>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
}

export function downloadGPX(trail: Trail) {
  const gpx = generateGPX(trail);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${trail.slug}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}
