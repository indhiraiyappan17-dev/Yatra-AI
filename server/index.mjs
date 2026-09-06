import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

/* =========================================================
   HELPER
========================================================= */

function getFallbackImage(type = "place") {
  const normalizedType = String(type).toLowerCase();

  if (
    normalizedType.includes("hotel") ||
    normalizedType.includes("guest_house") ||
    normalizedType.includes("hostel")
  ) {
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80";
  }

  if (
    normalizedType.includes("restaurant") ||
    normalizedType.includes("fast_food")
  ) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80";
  }

  if (normalizedType.includes("cafe")) {
    return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80";
  }

  return "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80";
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "YatraAI backend is running",
  });
});

/* =========================================================
   DESTINATION SEARCH
   Uses OpenStreetMap Nominatim
========================================================= */

app.get("/api/search", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Destination is required.",
    });
  }

  try {
    const url =
      "https://nominatim.openstreetmap.org/search" +
      `?q=${encodeURIComponent(query)}` +
      "&format=json" +
      "&limit=1";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "YatraAI-Tourism-App/1.0",
      },
    });

    if (!response.ok) {
      throw new Error("Nominatim search failed.");
    }

    const data = await response.json();

    if (!data.length) {
      return res.status(404).json({
        success: false,
        error: "Destination not found.",
      });
    }

    const location = data[0];

    res.json({
      success: true,
      name: location.display_name?.split(",")[0] || query,
      display_name: location.display_name,
      lat: Number(location.lat),
      lon: Number(location.lon),
    });
  } catch (error) {
    console.error("Destination search error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to search destination.",
    });
  }
});

/* =========================================================
   NEARBY PLACES
   Uses OpenStreetMap Overpass API
========================================================= */

app.get("/api/places", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({
      success: false,
      error: "Valid latitude and longitude are required.",
    });
  }

  try {
    const overpassQuery = `
      [out:json][timeout:25];

      (
        nwr["tourism"](around:5000,${lat},${lon});
        nwr["amenity"="restaurant"](around:5000,${lat},${lon});
        nwr["amenity"="cafe"](around:5000,${lat},${lon});
        nwr["amenity"="fast_food"](around:5000,${lat},${lon});
        nwr["tourism"="hotel"](around:5000,${lat},${lon});
      );

      out center tags;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "YatraAI-Tourism-App/1.0",
        },
        body: overpassQuery,
      }
    );

    if (!response.ok) {
      throw new Error("Overpass API request failed.");
    }

    const data = await response.json();

    const places = (data.elements || [])
      .map((element) => {
        const tags = element.tags || {};

        const elementLat =
          element.lat ?? element.center?.lat;

        const elementLon =
          element.lon ?? element.center?.lon;

        let type = "place";

        if (tags.tourism) {
          type = tags.tourism;
        } else if (tags.amenity) {
          type = tags.amenity;
        }

        return {
          id: element.id,

          name:
            tags.name ||
            tags["name:en"] ||
            "Unnamed place",

          type,

          lat: Number(elementLat),
          lon: Number(elementLon),

          address:
            tags["addr:street"] ||
            tags["addr:city"] ||
            "",

          website:
            tags.website ||
            tags["contact:website"] ||
            "",

          phone:
            tags.phone ||
            tags["contact:phone"] ||
            "",
        };
      })
      .filter(
        (place) =>
          place.name !== "Unnamed place" &&
          Number.isFinite(place.lat) &&
          Number.isFinite(place.lon)
      );

    res.json({
      success: true,
      count: places.length,
      places,
    });
  } catch (error) {
    console.error("Places API error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to load nearby places.",
    });
  }
});

/* =========================================================
   REAL PLACE IMAGE SEARCH
   Uses Wikimedia Commons
========================================================= */

app.get("/api/image", async (req, res) => {
  const query = String(req.query.q || "").trim();
  const type = String(req.query.type || "place").trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Image search query is required.",
    });
  }

  try {
    /*
      We try multiple search queries.

      Example:
      "Vivekananda Rock Memorial attraction"
      "Vivekananda Rock Memorial"
      "Kanyakumari tourism"
    */

    const searchQueries = [
      query,
      query.replace(/\b(attraction|hotel|restaurant|cafe|viewpoint)\b/gi, "").trim(),
    ];

    let imageUrl = null;

    for (const searchQuery of searchQueries) {
      if (!searchQuery) {
        continue;
      }

      const url =
        "https://commons.wikimedia.org/w/api.php" +
        "?action=query" +
        "&generator=search" +
        `&gsrsearch=${encodeURIComponent(searchQuery)}` +
        "&gsrnamespace=6" +
        "&gsrlimit=3" +
        "&prop=imageinfo" +
        "&iiprop=url" +
        "&iiurlwidth=1000" +
        "&format=json" +
        "&origin=*";

      const response = await fetch(url, {
        headers: {
          "User-Agent": "YatraAI-Tourism-App/1.0",
        },
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      const pages = data.query?.pages;

      if (!pages) {
        continue;
      }

      const pageList = Object.values(pages);

      for (const page of pageList) {
        const info = page?.imageinfo?.[0];

        const candidate =
          info?.thumburl ||
          info?.url ||
          null;

        if (candidate) {
          imageUrl = candidate;
          break;
        }
      }

      if (imageUrl) {
        break;
      }
    }

    /*
      If Wikimedia doesn't have an image,
      return a category-based fallback.
    */

    if (!imageUrl) {
      imageUrl = getFallbackImage(type);
    }

    res.json({
      success: true,
      image: imageUrl,
      source: imageUrl.includes("wikimedia")
        ? "Wikimedia Commons"
        : "Fallback",
    });
  } catch (error) {
    console.error("Image search error:", error);

    /*
      Even if Wikimedia fails completely,
      the frontend still receives an image.
    */

    res.json({
      success: true,
      image: getFallbackImage(type),
      source: "Fallback",
    });
  }
});

/* =========================================================
   WEATHER
   Uses Open-Meteo
========================================================= */

app.get("/api/weather", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return res.status(400).json({
      success: false,
      error: "Valid latitude and longitude are required.",
    });
  }

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
      "&timezone=auto";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather API request failed.");
    }

    const data = await response.json();

    res.json({
      success: true,
      weather: data.current,
    });
  } catch (error) {
    console.error("Weather API error:", error);

    res.status(500).json({
      success: false,
      error: "Unable to load weather information.",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(port, () => {
  console.log(
    `YatraAI backend running on http://localhost:${port}`
  );
});