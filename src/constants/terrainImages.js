// Card/hero background photos, keyed by the hike's terrainType field.
// Sourced from Wikimedia Commons (CC BY-SA) — see assets/images/hikes/ATTRIBUTION.md.
export const terrainImages = {
  Mountain: require("../../assets/images/hikes/mountain.jpg"),
  Forest: require("../../assets/images/hikes/forest.jpg"),
  Coastal: require("../../assets/images/hikes/coastal.jpg"),
  Valley: require("../../assets/images/hikes/valley.jpg"),
  Other: require("../../assets/images/hikes/other.jpg"),
};

export function getTerrainImage(terrainType) {
  return terrainImages[terrainType] ?? terrainImages.Other;
}
