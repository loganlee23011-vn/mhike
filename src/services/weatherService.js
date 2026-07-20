const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function getCurrentWeather(latitude, longitude) {
  if (!API_KEY) {
    throw new Error(
      "Missing EXPO_PUBLIC_OPENWEATHER_API_KEY. Add it to your .env file."
    );
  }

  const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather request failed with status ${response.status}`);
  }

  const data = await response.json();

  return {
    temperature: data.main?.temp ?? null,
    feelsLike: data.main?.feels_like ?? null,
    description: data.weather?.[0]?.description ?? "",
    icon: data.weather?.[0]?.icon ?? null,
    windSpeed: data.wind?.speed ?? null,
    humidity: data.main?.humidity ?? null,
  };
}
