const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const WIKIMEDIA_URL = "https://commons.wikimedia.org/w/api.php";

const HEADERS = {
  "User-Agent": "YatraAI/1.0 (college tourism project)",
  Accept: "application/json",
};

// --------------------------------------------------
// PLACE TYPE
// --------------------------------------------------

function getPlaceType(tags = {}) {
  if (tags.tourism === "museum") return "Museum";
  if (tags.tourism === "attraction") return "Tourist Attraction";
  if (tags.tourism === "viewpoint") return "Viewpoint";
  if (tags.tourism === "zoo") return "Zoo";
  if (tags.tourism === "theme_park") return "Theme Park";
  if (tags.tourism === "gallery") return "Gallery";
  if (tags.tourism === "artwork") return "Artwork";

  if (tags.historic === "temple") return "Temple";
  if (tags.historic === "monument") return "Monument";
  if (tags.historic === "castle") return "Castle";
  if (tags.historic === "fort") return "Fort";

  if (tags.amenity === "place_of_worship") {
    return "Place of Worship";
  }

  if (tags.leisure === "park") return "Park";

  return "Tourist Place";
}

// --------------------------------------------------
// ADDRESS
// --------------------------------------------------

function getAddress(tags = {}) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:district"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.join(", ");
}

// --------------------------------------------------
// COORDINATES
// --------------------------------------------------

function getCoordinates(element) {
  if (
    element.lat !== undefined &&
    element.lon !== undefined
  ) {
    return {
      latitude: Number(element.lat),
      longitude: Number(element.lon),
    };
  }

  if (element.center) {
    return {
      latitude: Number(element.center.lat),
      longitude: Number(element.center.lon),
    };
  }

  return {
    latitude: null,
    longitude: null,
  };
}

// --------------------------------------------------
// GOOGLE MAPS LINKS
// --------------------------------------------------

function createMapsUrls(latitude, longitude) {
  if (
    latitude === null ||
    longitude === null ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return {
      mapsUrl: null,
      directionsUrl: null,
    };
  }

  return {
    mapsUrl:
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,

    directionsUrl:
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  };
}

// --------------------------------------------------
// SEARCH LOCATION USING NOMINATIM
// --------------------------------------------------

export async function searchLocation(query) {
  if (!query || !query.trim()) {
    throw new Error("Location is required");
  }

  const url = new URL(NOMINATIM_URL);

  url.searchParams.set("q", query.trim());
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "in");

  const response = await fetch(url, {
    headers: HEADERS,
  });

  if (!response.ok) {
    throw new Error(
      `Nominatim request failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const location = data[0];

  return {
    displayName: location.display_name,
    latitude: Number(location.lat),
    longitude: Number(location.lon),
    type: location.type || null,
    placeId: location.place_id || null,
  };
}

// --------------------------------------------------
// GET REAL TOURIST PLACES FROM OPENSTREETMAP
// --------------------------------------------------

export async function getTouristPlaces(
  latitude,
  longitude
) {
  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude === null ||
    longitude === null
  ) {
    throw new Error(
      "Latitude and longitude are required"
    );
  }

  const radius = 5000;

  const query = `
[out:json][timeout:25];

(
  nwr["tourism"="attraction"](around:${radius},${latitude},${longitude});
  nwr["tourism"="museum"](around:${radius},${latitude},${longitude});
  nwr["tourism"="viewpoint"](around:${radius},${latitude},${longitude});
  nwr["tourism"="zoo"](around:${radius},${latitude},${longitude});
  nwr["tourism"="theme_park"](around:${radius},${latitude},${longitude});
  nwr["tourism"="gallery"](around:${radius},${latitude},${longitude});
  nwr["tourism"="artwork"](around:${radius},${latitude},${longitude});

  nwr["historic"="monument"](around:${radius},${latitude},${longitude});
  nwr["historic"="fort"](around:${radius},${latitude},${longitude});
  nwr["historic"="castle"](around:${radius},${latitude},${longitude});
  nwr["historic"="temple"](around:${radius},${latitude},${longitude});

  nwr["amenity"="place_of_worship"](around:${radius},${latitude},${longitude});

  nwr["leisure"="park"](around:${radius},${latitude},${longitude});
);

out center tags;
`;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",

    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded",
      ...HEADERS,
    },

    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(
      `Overpass request failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.elements)) {
    return [];
  }

  const places = data.elements
    .map((element) => {
      const tags = element.tags || {};

      if (!tags.name) {
        return null;
      }

      const coordinates =
        getCoordinates(element);

      const maps = createMapsUrls(
        coordinates.latitude,
        coordinates.longitude
      );

      return {
        id: `${element.type}-${element.id}`,

        name: tags.name,

        type: getPlaceType(tags),

        address:
          getAddress(tags) ||
          tags["addr:full"] ||
          "Address unavailable",

        latitude: coordinates.latitude,

        longitude: coordinates.longitude,

        website:
          tags.website ||
          tags["contact:website"] ||
          null,

        phone:
          tags.phone ||
          tags["contact:phone"] ||
          null,

        openingHours:
          tags.opening_hours ||
          null,

        description:
          tags.description ||
          tags["description:en"] ||
          null,

        mapsUrl: maps.mapsUrl,

        directionsUrl:
          maps.directionsUrl,

        image: null,

        imageSource: null,

        imageSourceUrl: null,

        source: "OpenStreetMap",

        osmType: element.type,

        osmId: element.id,
      };
    })
    .filter(Boolean);

  // --------------------------------------------------
  // REMOVE DUPLICATES
  // --------------------------------------------------

  const uniquePlaces = [];

  const seen = new Set();

  for (const place of places) {
    const key = [
      place.name.toLowerCase(),
      place.latitude,
      place.longitude,
    ].join("-");

    if (!seen.has(key)) {
      seen.add(key);
      uniquePlaces.push(place);
    }
  }

  return uniquePlaces;
}

// --------------------------------------------------
// WIKIMEDIA COMMONS IMAGE
// --------------------------------------------------

export async function getPlaceImage(placeName) {
  if (!placeName || !placeName.trim()) {
    return null;
  }

  const url = new URL(WIKIMEDIA_URL);

  url.searchParams.set(
    "action",
    "query"
  );

  url.searchParams.set(
    "generator",
    "search"
  );

  url.searchParams.set(
    "gsrsearch",
    placeName
  );

  url.searchParams.set(
    "gsrnamespace",
    "6"
  );

  url.searchParams.set(
    "gsrlimit",
    "1"
  );

  url.searchParams.set(
    "prop",
    "imageinfo"
  );

  url.searchParams.set(
    "iiprop",
    "url|extmetadata"
  );

  url.searchParams.set(
    "iiurlwidth",
    "800"
  );

  url.searchParams.set(
    "format",
    "json"
  );

  url.searchParams.set(
    "origin",
    "*"
  );

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const pages = data?.query?.pages;

    if (!pages) {
      return null;
    }

    const page =
      Object.values(pages)[0];

    const imageInfo =
      page?.imageinfo?.[0];

    if (!imageInfo) {
      return null;
    }

    return {
      imageUrl:
        imageInfo.thumburl ||
        imageInfo.url ||
        null,

      sourceUrl:
        imageInfo.descriptionurl ||
        null,

      source:
        "Wikimedia Commons",
    };
  } catch {
    return null;
  }
}

// --------------------------------------------------
// ADD REAL IMAGES TO PLACES
// --------------------------------------------------

export async function addPlaceImages(
  places
) {
  const result = [];

  for (const place of places) {
    const image =
      await getPlaceImage(
        place.name
      );

    result.push({
      ...place,

      image:
        image?.imageUrl ||
        null,

      imageSource:
        image?.source ||
        null,

      imageSourceUrl:
        image?.sourceUrl ||
        null,
    });
  }

  return result;
}

// --------------------------------------------------
// MAIN FUNCTION
// --------------------------------------------------

export async function findPlaces(
  locationName
) {
  const location =
    await searchLocation(
      locationName
    );

  if (!location) {
    return {
      location: null,
      places: [],
    };
  }

  const places =
    await getTouristPlaces(
      location.latitude,
      location.longitude
    );

  const placesWithImages =
    await addPlaceImages(
      places
    );

  return {
    location,

    places:
      placesWithImages,
  };
}