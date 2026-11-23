"use server";

type StationResult = { station?: string; error?: string };

export async function findFuelStation(latitude: number, longitude: number, accuracy: number): Promise<StationResult> {
  if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0 || accuracy > 150) {
    return { error: "Location is not precise enough. Enter the station manually." };
  }
  const lat = Number(latitude.toFixed(5));
  const lon = Number(longitude.toFixed(5));
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: `[out:json][timeout:5];nwr[amenity=fuel](around:150,${lat},${lon});out center;` }),
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error("Station lookup failed");
    const { elements } = await response.json() as { elements: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: { name?: string; brand?: string; operator?: string } }[] };
    const nearby = elements.flatMap((item) => {
      const name = item.tags?.name || item.tags?.brand || item.tags?.operator;
      const pointLat = item.center?.lat ?? item.lat;
      const pointLon = item.center?.lon ?? item.lon;
      if (!name || typeof pointLat !== "number" || typeof pointLon !== "number" || !Number.isFinite(pointLat) || !Number.isFinite(pointLon)) return [];
      const distance = Math.hypot((pointLat - lat) * 111_320, (pointLon - lon) * 111_320 * Math.cos(lat * Math.PI / 180));
      return [{ name, distance }];
    }).sort((first, second) => first.distance - second.distance);
    const nearest = nearby[0];
    return nearest && nearest.distance <= 150 ? { station: nearest.name.slice(0, 150) } : { error: "No named station found nearby. Enter it manually." };
  } catch {
    return { error: "Station lookup is unavailable. Enter the station manually." };
  }
}

