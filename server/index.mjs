import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

/* =========================================================
   CONSTANTS
========================================================= */

const USER_AGENT = "YatraAI-Tourism-App/1.0";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const WIKIMEDIA_API = "https://commons.wikimedia.org/w/api.php";

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getAddress(tags) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] ||
      tags["addr:town"] ||
      tags["addr:village"],
    tags["addr:postcode"],
    tags["addr:state"],
  ].filter(Boolean);

  return parts.join(", ");
}

function getPlaceType(tags) {
  if (tags.tourism) {
    return tags.tourism;
  }

  if (tags.historic) {
    return tags.historic;
  }

  if (tags.amenity) {
    return tags.amenity;
  }

  if (tags.leisure) {
    return tags.leisure;
  }

  return "place";
}

function getPlaceName(tags) {
  return (
    tags.name ||
    tags["name:en"] ||
    tags["official_name"] ||
    ""
  ).trim();
}

function getWebsite(tags) {
  return (
    tags.website ||
    tags["contact:website"] ||
    tags.url ||
    ""
  ).trim();
}

function getPhone(tags) {
  return (
    tags.phone ||
    tags["contact:phone"] ||
    ""
  ).trim();
}

function getImageFromOSM(tags) {
  if (tags.image) {
    return tags.image;
  }

  if (tags.wikimedia_commons) {
    return null;
  }

  return null;
}

function getGoogleMapsUrl(lat, lon) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

function getGoogleDirectionsUrl(lat, lon) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
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
      NOMINATIM_URL +
      `?q=${encodeURIComponent(query)}` +
      "&format=json" +
      "&limit=1";

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
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

      name:
        location.display_name?.split(",")[0] ||
        query,

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
   REAL TOURIST PLACES
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
      [out:json][timeout:30];

      (
        nwr["tourism"](around:5000,${lat},${lon});

        nwr["historic"](around:5000,${lat},${lon});

        nwr["leisure"="park"](around:5000,${lat},${lon});

        nwr["leisure"="garden"](around:5000,${lat},${lon});

        nwr["amenity"="restaurant"](around:5000,${lat},${lon});

        nwr["amenity"="cafe"](around:5000,${lat},${lon});

        nwr["amenity"="fast_food"](around:5000,${lat},${lon});
      );

      out center tags;
    `;

    const response = await fetch(OVERPASS_URL, {
      method: "POST",

      headers: {
        "Content-Type": "text/plain",
        "User-Agent": USER_AGENT,
      },

      body: overpassQuery,
    });

    if (!response.ok) {
      throw new Error("Overpass API request failed.");
    }

    const data = await response.json();

    const places = (data.elements || [])
      .map((element) => {
        const tags = element.tags || {};

        const elementLat =
          element.lat ??
          element.center?.lat;

        const elementLon =
          element.lon ??
          element.center?.lon;

        const placeLat = Number(elementLat);
        const placeLon = Number(elementLon);

        const name = getPlaceName(tags);

        if (
          !name ||
          !Number.isFinite(placeLat) ||
          !Number.isFinite(placeLon)
        ) {
          return null;
        }

        const type = getPlaceType(tags);

        const distance = calculateDistanceKm(
          lat,
          lon,
          placeLat,
          placeLon
        );

        const osmUrl =
          `https://www.openstreetmap.org/` +
          `${element.type}/${element.id}`;

        return {
          id: `${element.type}-${element.id}`,

          name,

          type,

          category: type,

          lat: placeLat,

          lon: placeLon,

          address: getAddress(tags),

          website: getWebsite(tags),

          phone: getPhone(tags),

          image: getImageFromOSM(tags),

          wikimedia_commons:
            tags.wikimedia_commons || "",

          osm_url: osmUrl,

          maps_url:
            getGoogleMapsUrl(
              placeLat,
              placeLon
            ),

          directions_url:
            getGoogleDirectionsUrl(
              placeLat,
              placeLon
            ),

          distance_km:
            Number(distance.toFixed(2)),
        };
      })
      .filter(Boolean);

    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const uniquePlaces = [];

    const seen = new Set();

    for (const place of places) {
      const key =
        `${place.name.toLowerCase()}-` +
        `${place.lat.toFixed(5)}-` +
        `${place.lon.toFixed(5)}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniquePlaces.push(place);
      }
    }

    /* =====================================================
       SORT NEAREST FIRST
    ===================================================== */

    uniquePlaces.sort(
      (a, b) =>
        a.distance_km -
        b.distance_km
    );

    res.json({
      success: true,

      count: uniquePlaces.length,

      places: uniquePlaces,
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
   REAL PLACE IMAGE
   Uses Wikimedia Commons
========================================================= */

app.get("/api/image", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Image search query is required.",
    });
  }

  try {
    const cleanQuery = query
      .replace(
        /\b(attraction|museum|hotel|restaurant|cafe|viewpoint|park|monument|place)\b/gi,
        ""
      )
      .trim();

    if (!cleanQuery) {
      return res.json({
        success: true,
        image: null,
        source: null,
      });
    }

    const url =
      WIKIMEDIA_API +
      "?action=query" +
      "&generator=search" +
      `&gsrsearch=${encodeURIComponent(cleanQuery)}` +
      "&gsrnamespace=6" +
      "&gsrlimit=10" +
      "&prop=imageinfo" +
      "&iiprop=url" +
      "&iiurlwidth=1000" +
      "&format=json" +
      "&origin=*";

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(
        "Wikimedia image search failed."
      );
    }

    const data = await response.json();

    const pages =
      data.query?.pages || {};

    const pageList =
      Object.values(pages);

    const searchWords =
      cleanQuery
        .toLowerCase()
        .split(/\s+/)
        .filter(
          (word) =>
            word.length >= 3
        );

    let bestImage = null;

    for (const page of pageList) {
      const title =
        String(page.title || "")
          .toLowerCase();

      const matchedWords =
        searchWords.filter(
          (word) =>
            title.includes(word)
        );

      if (
        matchedWords.length === 0
      ) {
        continue;
      }

      const info =
        page.imageinfo?.[0];

      const candidate =
        info?.thumburl ||
        info?.url ||
        null;

      if (!candidate) {
        continue;
      }

      bestImage = candidate;
      break;
    }

    res.json({
      success: true,

      image: bestImage,

      source: bestImage
        ? "Wikimedia Commons"
        : null,
    });
  } catch (error) {
    console.error(
      "Image search error:",
      error
    );

    res.json({
      success: true,

      image: null,

      source: null,
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

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Weather API request failed."
      );
    }

    const data =
      await response.json();

    res.json({
      success: true,

      weather:
        data.current,
    });
  } catch (error) {
    console.error(
      "Weather API error:",
      error
    );

    res.status(500).json({
      success: false,
      error:
        "Unable to load weather information.",
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