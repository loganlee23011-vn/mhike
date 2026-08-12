import * as Location from "expo-location";

// getCurrentPositionAsync can hang for a long time waiting for a fresh GPS
// fix. getLastKnownPositionAsync returns the device's cached fix instantly,
// so try that first and only wait on a live fix (with a short timeout) if
// no cached one exists — this is what actually cuts perceived load time.
const POSITION_TIMEOUT_MS = 6000;
const MAX_CACHED_AGE_MS = 5 * 60 * 1000;

function timeout(ms, message) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
}

export async function getCurrentLocation() {
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error("Turn on device location services to use this feature.");
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission was denied.");
  }

  const cached = await Location.getLastKnownPositionAsync({
    maxAge: MAX_CACHED_AGE_MS,
  });
  if (cached) {
    return { latitude: cached.coords.latitude, longitude: cached.coords.longitude };
  }

  let position;
  try {
    position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      timeout(POSITION_TIMEOUT_MS, "Timed out waiting for a GPS fix."),
    ]);
  } catch (err) {
    throw new Error(
      "Couldn't get your location. On an emulator, set a mock location in Extended Controls."
    );
  }

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
