```javascript
/**
 * YatraAI - Real Restaurant Service
 *
 * Data source:
 * - OpenStreetMap Nominatim
 * - OpenStreetMap Overpass API
 *
 * No fake restaurant data is generated.
 */

const USER_AGENT = "YatraAI-Tourism-App/1.0";

const NOMINATIM_URL =
  "https://nominatim.openstreetmap.org/search";

const OVERPASS_URL =
  "https://overpass-api.de/api/interpreter";

/**
 * Convert a city/destination name into coordinates.
 */
async function geocodeLocation(location) {
  const url =
    `${NOMINATIM_URL}?` +
    `q=${encodeURIComponent(location)}` +
    `&format=json` +
    `&limit=1` +
    `&addressdetails=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Nominatim geocoding failed.");
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    displayName: data[0].display_name || location,
  };
}

/**
 * Build a readable address from OSM address tags.
 */
function buildAddress(tags) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"] ||
      tags["addr:town"] ||
      tags["addr:village"],
    tags["addr:district"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Create Google Maps search URL.
 */
function createGoogleMapsUrl(lat, lon) {
  return (
    "https://www.google.com/maps/search/" +
    `?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`
  );
}

/**
 * Create Google Maps directions URL.
 */
function createDirectionsUrl(lat, lon) {
  return (
    "https://www.google.com/maps/dir/" +
    `?api=1&destination=${encodeURIComponent(`${lat},${lon}`)}`
  );
}

/**
 * Convert an OSM element into our restaurant response format.
 */
function normalizeRestaurant(element) {
  const tags = element.tags || {};

  const lat =
    element.lat ??
    element.center?.lat;

  const lon =
    element.lon ??
    element.center?.lon;

  const name =
    tags.name ||
    tags["name:en"];

  // Do not return unnamed restaurants.
  if (!name) {
    return null;
  }

  if (
    !Number.isFinite(Number(lat)) ||
    !Number.isFinite(Number(lon))
  ) {
    return null;
  }

  const restaurantLat = Number(lat);
  const restaurantLon = Number(lon);

  return {
    id: `${element.type}-${element.id}`,

    name,

    cuisine:
      tags.cuisine ||
      tags["cuisine:en"] ||
      null,

    foodType:
      tags["diet:vegetarian"] === "yes"
        ? "Vegetarian"
        : null,

    address: buildAddress(tags),

    latitude: restaurantLat,

    longitude: restaurantLon,

    phone:
      tags.phone ||
      tags["contact:phone"] ||
      null,

    website:
      tags.website ||
      tags["contact:website"] ||
      null,

    openingHours:
      tags.opening_hours ||
      null,

    osmType: element.type,

    osmId: element.id,

    googleMapsUrl:
      createGoogleMapsUrl(
        restaurantLat,
        restaurantLon
      ),

    directionsUrl:
      createDirectionsUrl(
        restaurantLat,
        restaurantLon
      ),

    source: "OpenStreetMap",
  };
}

/**
 * Fetch real restaurants from OpenStreetMap Overpass.
 */
async function fetchRestaurants(
  latitude,
  longitude,
  radius = 5000
) {
  const overpassQuery = `
[out:json][timeout:30];

(
  nwr[
    "amenity"="restaurant"
  ](
    around:${radius},
    ${latitude},
    ${longitude}
  );

  nwr[
    "amenity"="fast_food"
  ](
    around:${radius},
    ${latitude},
    ${longitude}
  );
);

out center tags;
`;

  const response = await fetch(
    OVERPASS_URL,
    {
      method: "POST",

      headers: {
        "Content-Type": "text/plain",
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },

      body: overpassQuery,
    }
  );

  if (!response.ok) {
    throw new Error(
      "OpenStreetMap Overpass request failed."
    );
  }

  const data = await response.json();

  const restaurants =
    (data.elements || [])
      .map(normalizeRestaurant)
      .filter(Boolean);

  /**
   * Remove duplicate restaurant records.
   */
  const uniqueRestaurants = Array.from(
    new Map(
      restaurants.map((restaurant) => [
        restaurant.id,
        restaurant,
      ])
    ).values()
  );

  /**
   * Sort by name for stable frontend display.
   */
  uniqueRestaurants.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return uniqueRestaurants;
}

/**
 * Main restaurant search function.
 *
 * Example:
 *
 * const result = await searchRestaurants("Trichy");
 */
export async function searchRestaurants(
  location,
  radius = 5000
) {
  const cleanLocation = String(
    location || ""
  ).trim();

  if (!cleanLocation) {
    throw new Error(
      "Restaurant search location is required."
    );
  }

  const coordinates =
    await geocodeLocation(cleanLocation);

  if (!coordinates) {
    return {
      success: false,

      location: cleanLocation,

      restaurants: [],

      count: 0,

      message:
        "Location was not found using OpenStreetMap.",
    };
  }

  const restaurants =
    await fetchRestaurants(
      coordinates.lat,
      coordinates.lon,
      radius
    );

  return {
    success: true,

    location: {
      query: cleanLocation,

      name: coordinates.displayName,

      latitude: coordinates.lat,

      longitude: coordinates.lon,
    },

    count: restaurants.length,

    restaurants,
  };
}
```
