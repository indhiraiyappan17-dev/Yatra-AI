import "dotenv/config";
import cors from "cors";
import express from "express";

import {
  generateChatResponse,
  generateItinerary,
} from "./gemini.mjs";

const app = express();

const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

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

    return res.json({
      success: true,
      name: location.display_name?.split(",")[0] || query,
      display_name: location.display_name,
      lat: Number(location.lat),
      lon: Number(location.lon),
    });
  } catch (error) {
    console.error("Destination search error:", error);

    return res.status(500).json({
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
            tags["addr:full"] ||
            "",

          website:
            tags.website ||
            tags["contact:website"] ||
            "",

          phone:
            tags.phone ||
            tags["contact:phone"] ||
            "",

          image:
            tags.image ||
            tags["image:0"] ||
            "",

          wikipedia:
            tags.wikipedia || "",

          wikimedia_commons:
            tags.wikimedia_commons || "",
        };
      })
      .filter(
        (place) =>
          place.name !== "Unnamed place" &&
          Number.isFinite(place.lat) &&
          Number.isFinite(place.lon)
      );

    return res.json({
      success: true,
      count: places.length,
      places,
    });
  } catch (error) {
    console.error("Places API error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to load nearby places.",
    });
  }
});

/* =========================================================
   GEMINI AI CHATBOT
========================================================= */

app.post("/api/ai/chat", async (req, res) => {
  try {
    const {
      message,
      destination = "",
      context = "",
      history = [],
    } = req.body || {};

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        error: "Chat message is required.",
      });
    }

    const reply = await generateChatResponse({
      message: String(message),
      destination: String(destination || ""),
      context: String(context || ""),
      history: Array.isArray(history) ? history : [],
    });

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Gemini chatbot error:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to get response from Gemini.",
    });
  }
});

/* =========================================================
   GEMINI AI ITINERARY
========================================================= */

app.post("/api/ai/itinerary", async (req, res) => {
  try {
    const {
      destination,
      days = 3,
      budget = "moderate",
      travelType = "general",
      interests = "",
      context = "",
    } = req.body || {};

    if (!destination || !String(destination).trim()) {
      return res.status(400).json({
        success: false,
        error: "Destination is required.",
      });
    }

    const itinerary = await generateItinerary({
      destination: String(destination),
      days,
      budget: String(budget || "moderate"),
      travelType: String(travelType || "general"),
      interests: String(interests || ""),
      context: String(context || ""),
    });

    return res.json({
      success: true,
      itinerary,
    });
  } catch (error) {
    console.error("Gemini itinerary error:", error);

    return res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate itinerary.",
    });
  }
});

/* =========================================================
   TEXT NORMALIZATION
========================================================= */

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[_\-:;,.()[\]{}'"`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   BUSINESS PLACE CHECK
========================================================= */

function isBusinessType(type) {
  const normalizedType = normalizeText(type);

  return (
    normalizedType.includes("hotel") ||
    normalizedType.includes("resort") ||
    normalizedType.includes("hostel") ||
    normalizedType.includes("guest house") ||
    normalizedType.includes("motel") ||
    normalizedType.includes("restaurant") ||
    normalizedType.includes("cafe") ||
    normalizedType.includes("fast food")
  );
}

/* =========================================================
   EXACT IMAGE TITLE MATCH
========================================================= */

function isVerifiedPlaceMatch(title, placeName, type) {
  const normalizedTitle = normalizeText(title);
  const normalizedPlace = normalizeText(placeName);

  if (!normalizedTitle || !normalizedPlace) {
    return false;
  }

  const business = isBusinessType(type);

  if (business) {
    return normalizedTitle.includes(normalizedPlace);
  }

  if (normalizedTitle.includes(normalizedPlace)) {
    return true;
  }

  const words = normalizedPlace
    .split(" ")
    .filter((word) => word.length >= 3);

  if (words.length === 0) {
    return false;
  }

  const matchedWords = words.filter((word) =>
    normalizedTitle.includes(word)
  );

  if (words.length <= 2) {
    return matchedWords.length === words.length;
  }

  return (
    matchedWords.length >=
    Math.ceil(words.length * 0.8)
  );
}

/* =========================================================
   CATEGORY SAFETY
========================================================= */

function isCategoryCompatible(title, type) {
  const text = normalizeText(title);
  const normalizedType = normalizeText(type);

  const hotelWords = [
    "hotel",
    "resort",
    "hostel",
    "guest house",
    "motel",
    "inn",
    "lodge",
  ];

  const foodWords = [
    "restaurant",
    "cafe",
    "coffee",
    "food",
    "dining",
    "bakery",
    "bar",
  ];

  const touristWords = [
    "temple",
    "church",
    "mosque",
    "museum",
    "palace",
    "fort",
    "monument",
    "memorial",
    "park",
    "beach",
    "waterfall",
    "viewpoint",
    "tower",
    "lake",
    "dam",
    "sanctuary",
    "zoo",
    "cathedral",
    "shrine",
  ];

  const isHotel =
    normalizedType.includes("hotel") ||
    normalizedType.includes("resort") ||
    normalizedType.includes("hostel") ||
    normalizedType.includes("guest house") ||
    normalizedType.includes("motel");

  const isFood =
    normalizedType.includes("restaurant") ||
    normalizedType.includes("cafe") ||
    normalizedType.includes("fast food");

  const titleLooksTourist = touristWords.some(
    (word) => text.includes(word)
  );

  const titleLooksHotel = hotelWords.some(
    (word) => text.includes(word)
  );

  const titleLooksFood = foodWords.some(
    (word) => text.includes(word)
  );

  if (isHotel && titleLooksTourist) {
    return false;
  }

  if (isFood && titleLooksTourist) {
    return false;
  }

  if (isHotel && titleLooksFood) {
    return false;
  }

  if (isFood && titleLooksHotel) {
    return false;
  }

  return true;
}

/* =========================================================
   IMAGE SEARCH
   Wikimedia Commons + Wikipedia

   IMPORTANT:
   No generic fallback image.
========================================================= */

app.get("/api/image", async (req, res) => {
  const query = String(req.query.q || "").trim();

  const type = String(
    req.query.type || "place"
  ).trim();

  const destination = String(
    req.query.destination || ""
  ).trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Image search query is required.",
    });
  }

  let placeName = query;

  const categoryPattern =
    /\b(hotel|restaurant|cafe|viewpoint|attraction|museum|place|fast_food|guest_house|hostel|resort|motel)\b/gi;

  placeName = placeName
    .replace(categoryPattern, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (destination) {
    const destinationWords = normalizeText(destination)
      .split(" ")
      .filter((word) => word.length >= 3);

    let possibleName = placeName;

    for (const word of destinationWords) {
      const regex = new RegExp(
        `\\b${word}\\b`,
        "gi"
      );

      possibleName = possibleName
        .replace(regex, " ");
    }

    possibleName = possibleName
      .replace(/\s+/g, " ")
      .trim();

    if (possibleName.length >= 3) {
      placeName = possibleName;
    }
  }

  console.log(
    `Image search started: "${placeName}" | type="${type}" | destination="${destination}"`
  );

  const business = isBusinessType(type);

  const searchQueries = [];

  if (business) {
    searchQueries.push(`"${placeName}"`);
  } else {
    if (destination) {
      searchQueries.push(
        `"${placeName}" "${destination}"`
      );
    }

    searchQueries.push(`"${placeName}"`);
    searchQueries.push(placeName);
  }

  /* =======================================================
     1. WIKIMEDIA COMMONS
  ======================================================= */

  try {
    for (const searchQuery of searchQueries) {
      const url =
        "https://commons.wikimedia.org/w/api.php" +
        "?action=query" +
        "&generator=search" +
        `&gsrsearch=${encodeURIComponent(searchQuery)}` +
        "&gsrnamespace=6" +
        "&gsrlimit=20" +
        "&prop=imageinfo" +
        "&iiprop=url" +
        "&iiurlwidth=1000" +
        "&format=json" +
        "&origin=*";

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "YatraAI-Tourism-App/1.0",
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
        const title = String(page.title || "");

        if (
          !isCategoryCompatible(title, type)
        ) {
          continue;
        }

        if (
          !isVerifiedPlaceMatch(
            title,
            placeName,
            type
          )
        ) {
          continue;
        }

        const info = page.imageinfo?.[0];

        const imageUrl =
          info?.thumburl ||
          info?.url ||
          null;

        if (!imageUrl) {
          continue;
        }

        console.log(
          `VERIFIED Wikimedia image: ${title}`
        );

        return res.json({
          success: true,
          image: imageUrl,
          source: "Wikimedia Commons",
        });
      }
    }
  } catch (error) {
    console.error(
      "Wikimedia image error:",
      error.message
    );
  }

  /* =======================================================
     2. WIKIPEDIA
  ======================================================= */

  try {
    for (const searchQuery of searchQueries) {
      const url =
        "https://en.wikipedia.org/w/api.php" +
        "?action=query" +
        "&generator=search" +
        `&gsrsearch=${encodeURIComponent(searchQuery)}` +
        "&gsrlimit=10" +
        "&prop=pageimages" +
        "&piprop=thumbnail" +
        "&pithumbsize=1000" +
        "&format=json" +
        "&origin=*";

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "YatraAI-Tourism-App/1.0",
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
        const title = String(page.title || "");

        if (
          !isCategoryCompatible(title, type)
        ) {
          continue;
        }

        if (
          !isVerifiedPlaceMatch(
            title,
            placeName,
            type
          )
        ) {
          continue;
        }

        const thumbnail =
          page.thumbnail?.source;

        if (!thumbnail) {
          continue;
        }

        console.log(
          `VERIFIED Wikipedia image: ${title}`
        );

        return res.json({
          success: true,
          image: thumbnail,
          source: "Wikipedia",
        });
      }
    }
  } catch (error) {
    console.error(
      "Wikipedia image error:",
      error.message
    );
  }

  /* =======================================================
     3. NO VERIFIED IMAGE
  ======================================================= */

  console.log(
    `NO VERIFIED IMAGE: ${placeName}`
  );

  return res.json({
    success: true,
    image: null,
    source: "No verified image available",
  });
});

/* =========================================================
   WEATHER
   Uses Open-Meteo
========================================================= */

app.get("/api/weather", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon)
  ) {
    return res.status(400).json({
      success: false,
      error:
        "Valid latitude and longitude are required.",
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
      throw new Error(
        "Weather API request failed."
      );
    }

    const data = await response.json();

    return res.json({
      success: true,
      weather: data.current,
    });
  } catch (error) {
    console.error(
      "Weather API error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Unable to load weather information.",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */
console.log("GEMINI MODEL:", process.env.GEMINI_MODEL);
app.listen(port, () => {
  console.log(
    `YatraAI backend running on http://localhost:${port}`
  );
});