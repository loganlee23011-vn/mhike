import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { colors, spacing, typography } from "../constants/theme";
import { subscribeToHikes } from "../services/hikeService";

const DEFAULT_CENTER = { latitude: 54.5, longitude: -3.5, zoom: 5 };

function buildMapHtml(pins, center) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([${center.latitude}, ${center.longitude}], ${center.zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const pins = ${JSON.stringify(pins)};
    const bounds = [];
    pins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude]).addTo(map);
      marker.bindPopup('<b>' + pin.name + '</b><br/>' + pin.location);
      marker.on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ hikeId: pin.id }));
      });
      bounds.push([pin.latitude, pin.longitude]);
    });
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  </script>
</body>
</html>`;
}

export default function MapScreen({ navigation }) {
  const [hikes, setHikes] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToHikes(setHikes, (err) => console.error(err));
    return unsubscribe;
  }, []);

  const pins = useMemo(
    () =>
      hikes
        .filter((h) => typeof h.latitude === "number" && typeof h.longitude === "number")
        .map((h) => ({ id: h.id, name: h.name, location: h.location, latitude: h.latitude, longitude: h.longitude })),
    [hikes]
  );

  const center = pins.length > 0
    ? { latitude: pins[0].latitude, longitude: pins[0].longitude, zoom: 10 }
    : DEFAULT_CENTER;

  const html = useMemo(() => buildMapHtml(pins, center), [pins, center]);

  const handleMessage = (event) => {
    try {
      const { hikeId } = JSON.parse(event.nativeEvent.data);
      if (hikeId) navigation.navigate("Detail", { hikeId });
    } catch (err) {
      console.error("Failed to parse map message", err);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={[typography.h1, styles.title]}>Map</Text>
      {pins.length === 0 ? (
        <View style={styles.placeholder}>
          <Text style={typography.caption}>
            No hikes have a saved location yet. Use "Use current location" when adding a hike to see it here.
          </Text>
        </View>
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          style={styles.webview}
          onMessage={handleMessage}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  title: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm },
  webview: { flex: 1 },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
});
