import distance from "@turf/distance";
import { point } from "@turf/helpers";

export type LatLng = { lat: number; lng: number };

/** すれ違い判定の半径（メートル） */
export const ENCOUNTER_RADIUS_M = 50;

/** 2点間の距離をメートルで返す */
export function distanceInMeters(a: LatLng, b: LatLng): number {
  // GeoJSON は [経度, 緯度] の順
  return distance(point([a.lng, a.lat]), point([b.lng, b.lat]), {
    units: "meters",
  });
}

/** 半径内にいれば「すれ違い」とみなす */
export function isEncounter(
  a: LatLng,
  b: LatLng,
  radiusM: number = ENCOUNTER_RADIUS_M,
): boolean {
  return distanceInMeters(a, b) <= radiusM;
}
