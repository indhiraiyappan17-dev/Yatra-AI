import express from "express";

const router = express.Router();

const ACCOMMODATION_TYPES = [
  "hotel",
  "guest_house",
  "hostel",
  "motel",
  "apartment",
  "chalet",
  "resort",
  "camp_site",
  "caravan_site",
];

function buildAddress(tags = {}) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:district"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.join(", ") || "Address not available";
}

function getGoogleMapsUrl(lat, lon) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

function getDirectionsUrl(lat, lon) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

function getOpenStreetMapUrl(lat, lon) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

function getBookingSearchUrl(name, address) {
  const query = encodeURIComponent(`${name} ${address} hotel booking`);
  return `https://www.google.com/search?q=${query}`;
}

function mapHotel(element) {
  const tags = element.tags || {};

  const latitude = Number(element.lat ?? element.center?.lat);
  const longitude = Number(element.lon ?? element.center?.lon);

  const type = tags.tourism || "hotel";

  return {
    id: String(element.id),

    name: tags.name || "Unnamed accommodation",

    type,

    category: type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),

    latitude,
    longitude,

    address: buildAddress(tags),

    phone:
      tags.phone ||
      tags["contact:phone"] ||
      null,

    website:
      tags.website ||
      tags["contact:website"] ||
      null,

    image:
      tags.image ||
      null,

    stars:
      tags.stars ||
      null,

    rooms:
      tags.rooms ||
      null,

    beds:
      tags.beds ||
      null,

    operator:
      tags.operator ||
      null,

    openingHours:
      tags.opening_hours ||
      null,

    googleMapsUrl: getGoogleMapsUrl(latitude, longitude),

    directionsUrl: getDirectionsUrl(latitude, longitude),

    openStreetMapUrl: getOpenStreetMapUrl(
      latitude,
      longitude
    ),

    bookingSearchUrl: getBookingSearchUrl(
      tags.name || "accommodation",
      buildAddress(tags)
    ),

    source: "OpenStreetMap",
  };
}


/* --------------------------------
   GET ALL HOTELS
   /api/hotels?lat=...&lon=...
-------------------------------- */

router.get("/api/hotels", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const tourismFilters = ACCOMMODATION_TYPES
      .map(
        (type) =>
          `nwr["tourism"="${type}"](around:7000,${lat},${lon});`
      )
      .join("\n");

    const query = `
      [out:json][timeout:25];

      (
        ${tourismFilters}
      );

      out center tags;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",

        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "YatraAI-HotelModule/1.0",
        },

        body: query,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Overpass API error: ${response.status}`
      );
    }

    const result = await response.json();

    const hotels = (result.elements || [])
      .map(mapHotel)
      .filter(
        (hotel) =>
          hotel.name !== "Unnamed accommodation" &&
          Number.isFinite(hotel.latitude) &&
          Number.isFinite(hotel.longitude)
      );

    const uniqueHotels = Array.from(
      new Map(
        hotels.map((hotel) => [
          `${hotel.name.toLowerCase()}-${hotel.latitude.toFixed(
            5
          )}-${hotel.longitude.toFixed(5)}`,
          hotel,
        ])
      ).values()
    );

    uniqueHotels.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return res.json({
      success: true,

      count: uniqueHotels.length,

      dataSource: {
        name: "OpenStreetMap",
        api: "Overpass API",
      },

      hotels: uniqueHotels,

      data: uniqueHotels,
    });
  } catch (error) {
    console.error("Hotel API Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch real accommodation data",
      error: error.message,
    });
  }
});


/* --------------------------------
   GET HOTEL DETAIL
   /api/hotels/detail?lat=...&lon=...&name=...
-------------------------------- */

router.get("/api/hotels/detail", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const name = String(req.query.name || "").trim();

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    const query = `
      [out:json][timeout:20];

      nwr
        ["tourism"]
        ["name"]
        (around:100,${lat},${lon});

      out center tags;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",

        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "YatraAI-HotelModule/1.0",
        },

        body: query,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Overpass API error: ${response.status}`
      );
    }

    const result = await response.json();

    const accommodations = (result.elements || [])
      .map(mapHotel)
      .filter((hotel) =>
        ACCOMMODATION_TYPES.includes(hotel.type)
      );

    let hotel = null;

    if (name) {
      hotel =
        accommodations.find(
          (item) =>
            item.name.toLowerCase() === name.toLowerCase()
        ) || null;

      if (!hotel) {
        hotel =
          accommodations.find((item) =>
            item.name
              .toLowerCase()
              .includes(name.toLowerCase())
          ) || null;
      }
    }

    if (!hotel) {
      hotel = accommodations[0] || null;
    }

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found in OpenStreetMap",
      });
    }

    return res.json({
      success: true,

      hotel,

      dataSource: "OpenStreetMap",
    });
  } catch (error) {
    console.error(
      "Hotel Detail API Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hotel details",
      error: error.message,
    });
  }
});


export default router;