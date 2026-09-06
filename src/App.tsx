import { useState } from "react";
import {
  MapPin,
  Search,
  Sparkles,
  Hotel,
  Utensils,
  CloudSun,
  Navigation,
  Wallet,
  Loader2,
  ImageOff,
} from "lucide-react";

type SearchResult = {
  name?: string;
  display_name?: string;
  lat?: number;
  lon?: number;
};

type Place = {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  address?: string;
  website?: string;
  phone?: string;
};

type PlaceWithImage = Place & {
  image?: string | null;
};

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const API_BASE = "http://localhost:5000";

function App() {
  const [destination, setDestination] = useState("");
  const [searching, setSearching] = useState(false);

  const [searchResult, setSearchResult] =
    useState<SearchResult | null>(null);

  const [places, setPlaces] = useState<PlaceWithImage[]>([]);

  const [error, setError] = useState("");
  const [imagesLoading, setImagesLoading] = useState(false);

  /* =====================================================
     SEARCH DESTINATION
  ===================================================== */

  const handleSearch = async () => {
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    setSearching(true);
    setError("");
    setSearchResult(null);
    setPlaces([]);

    try {
      /* Find destination */

      const searchResponse = await fetch(
        `${API_BASE}/api/search?q=${encodeURIComponent(
          destination.trim()
        )}`
      );

      const searchData = await searchResponse.json();

      if (!searchResponse.ok) {
        throw new Error(
          searchData.error || "Destination search failed."
        );
      }

      setSearchResult(searchData);

      /* Find nearby real places */

      const placesResponse = await fetch(
        `${API_BASE}/api/places?lat=${searchData.lat}&lon=${searchData.lon}`
      );

      const placesData = await placesResponse.json();

      if (!placesResponse.ok) {
        throw new Error(
          placesData.error ||
            "Unable to load nearby places."
        );
      }

      const realPlaces: PlaceWithImage[] =
        placesData.places || [];

      setPlaces(realPlaces);

      /* Load images */

      await loadPlaceImages(realPlaces);
    } catch (error) {
      console.error("Search error:", error);

      setError(
        "Unable to load destination information. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  /* =====================================================
     LOAD REAL IMAGES
  ===================================================== */

  const loadPlaceImages = async (
    placesToLoad: PlaceWithImage[]
  ) => {
    setImagesLoading(true);

    try {
      const updatedPlaces = await Promise.all(
        placesToLoad.map(async (place) => {
          try {
            const query = `${place.name} ${place.type}`;

            const response = await fetch(
              `${API_BASE}/api/image?q=${encodeURIComponent(
                query
              )}&type=${encodeURIComponent(place.type)}`
            );

            if (!response.ok) {
              return {
                ...place,
                image: null,
              };
            }

            const data = await response.json();

            return {
              ...place,
              image: data.image || null,
            };
          } catch (error) {
            console.error(
              `Image loading failed for ${place.name}:`,
              error
            );

            return {
              ...place,
              image: null,
            };
          }
        })
      );

      setPlaces(updatedPlaces);
    } finally {
      setImagesLoading(false);
    }
  };

  /* =====================================================
     CATEGORIES
  ===================================================== */

  const touristPlaces = places.filter((place) =>
    [
      "attraction",
      "museum",
      "viewpoint",
      "gallery",
      "theme_park",
      "zoo",
      "park",
      "memorial",
      "monument",
      "castle",
      "archaeological_site",
    ].includes(place.type)
  );

  const hotels = places.filter((place) =>
    [
      "hotel",
      "guest_house",
      "hostel",
      "motel",
      "resort",
    ].includes(place.type)
  );

  const restaurants = places.filter(
    (place) =>
      place.type === "restaurant" ||
      place.type === "fast_food"
  );

  const cafes = places.filter(
    (place) => place.type === "cafe"
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-sky-600 p-2">
              <MapPin className="h-5 w-5 text-white" />
            </div>

            <span className="text-xl font-bold text-slate-900">
              YatraAI
            </span>
          </div>

          <div className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#places"
              className="hover:text-sky-600"
            >
              Explore
            </a>

            <a
              href="#hotels"
              className="hover:text-sky-600"
            >
              Hotels
            </a>

            <a
              href="#restaurants"
              className="hover:text-sky-600"
            >
              Restaurants
            </a>

            <a
              href="#features"
              className="hover:text-sky-600"
            >
              Trip Planner
            </a>
          </div>

          <button
            type="button"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* =================================================
          HERO
      ================================================= */}

      <section className="bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Travel Assistant
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Your Journey.
            <br />

            <span className="text-sky-600">
              Your Plan. Your AI.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Search any destination and discover real
            tourist places, accommodation, restaurants,
            weather, routes, budgets and AI-powered travel
            guidance in one place.
          </p>

          {/* SEARCH */}

          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 text-slate-400" />

              <input
                type="text"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={(event) => {
                  setDestination(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full bg-transparent py-3 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-7 py-3 font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}

              {searching ? "Searching..." : "Explore"}
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Example: Chennai, Madurai, Kanyakumari, Ooty, Goa
          </p>

          {error && (
            <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          SEARCH RESULT
      ================================================= */}

      {searchResult && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          {/* DESTINATION */}

          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
                  Destination Found
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {searchResult.name || destination}
                </h2>

                <p className="mt-2 max-w-3xl text-slate-500">
                  {searchResult.display_name}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <MapPin className="h-5 w-5" />
                Real location data
              </div>
            </div>
          </div>

          {/* IMAGE LOADING */}

          {imagesLoading && (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-white py-5 text-sm text-slate-500 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              Finding real images...
            </div>
          )}

          {/* =================================================
              TOURIST PLACES
          ================================================= */}

          <div id="places" className="mt-12">
            <SectionTitle
              icon={<MapPin className="h-6 w-6" />}
              title="Tourist Places"
              description="Real places found near your destination."
            />

            {touristPlaces.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {touristPlaces
                  .slice(0, 12)
                  .map((place) => (
                    <PlaceCard
                      key={`${place.id}-${place.name}`}
                      place={place}
                    />
                  ))}
              </div>
            ) : (
              <EmptyMessage
                message="No tourist attractions were found in the available OpenStreetMap data."
              />
            )}
          </div>

          {/* =================================================
              HOTELS
          ================================================= */}

          <div id="hotels" className="mt-14">
            <SectionTitle
              icon={<Hotel className="h-6 w-6" />}
              title="Accommodation"
              description="Real hotels and accommodation available nearby."
            />

            {hotels.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hotels.slice(0, 12).map((place) => (
                  <PlaceCard
                    key={`${place.id}-${place.name}`}
                    place={place}
                  />
                ))}
              </div>
            ) : (
              <EmptyMessage
                message="No accommodation was found in the available OpenStreetMap data."
              />
            )}
          </div>

          {/* =================================================
              RESTAURANTS
          ================================================= */}

          <div id="restaurants" className="mt-14">
            <SectionTitle
              icon={<Utensils className="h-6 w-6" />}
              title="Restaurants"
              description="Real restaurants and food options nearby."
            />

            {restaurants.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {restaurants
                  .slice(0, 12)
                  .map((place) => (
                    <PlaceCard
                      key={`${place.id}-${place.name}`}
                      place={place}
                    />
                  ))}
              </div>
            ) : (
              <EmptyMessage
                message="No restaurants were found in the available OpenStreetMap data."
              />
            )}
          </div>

          {/* =================================================
              CAFES
          ================================================= */}

          <div className="mt-14">
            <SectionTitle
              icon={<Utensils className="h-6 w-6" />}
              title="Cafes"
              description="Nearby cafes available in the real map data."
            />

            {cafes.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cafes.slice(0, 9).map((place) => (
                  <PlaceCard
                    key={`${place.id}-${place.name}`}
                    place={place}
                  />
                ))}
              </div>
            ) : (
              <EmptyMessage
                message="No cafes were found in the available OpenStreetMap data."
              />
            )}
          </div>

          {/* =================================================
              MAP
          ================================================= */}

          {searchResult.lat && searchResult.lon && (
            <div className="mt-14">
              <SectionTitle
                icon={<Navigation className="h-6 w-6" />}
                title="Explore on Map"
                description="View your destination and nearby area."
              />

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <iframe
                  title="YatraAI Destination Map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    searchResult.lon - 0.08
                  }%2C${searchResult.lat - 0.06}%2C${
                    searchResult.lon + 0.08
                  }%2C${
                    searchResult.lat + 0.06
                  }&layer=mapnik&marker=${
                    searchResult.lat
                  }%2C${searchResult.lon}`}
                  className="h-[450px] w-full border-0"
                  loading="lazy"
                />
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${searchResult.lat},${searchResult.lon}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
              >
                <Navigation className="h-5 w-5" />
                Get Directions
              </a>
            </div>
          )}
        </section>
      )}

      {/* =================================================
          FEATURES
      ================================================= */}

      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-16"
      >
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
            Everything you need
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Plan your complete journey
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            YatraAI brings important travel information
            together so you do not have to search across
            multiple websites.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<MapPin className="h-6 w-6" />}
            title="Tourist Places"
            description="Discover real places to visit around your destination."
          />

          <FeatureCard
            icon={<Hotel className="h-6 w-6" />}
            title="Hotels"
            description="Find real accommodation options near your destination."
          />

          <FeatureCard
            icon={<Utensils className="h-6 w-6" />}
            title="Restaurants"
            description="Explore real restaurants and food options nearby."
          />

          <FeatureCard
            icon={<CloudSun className="h-6 w-6" />}
            title="Weather"
            description="Check weather before planning your trip."
          />

          <FeatureCard
            icon={<Navigation className="h-6 w-6" />}
            title="How to Reach"
            description="Get routes and directions for your journey."
          />

          <FeatureCard
            icon={<Wallet className="h-6 w-6" />}
            title="Budget Planner"
            description="Estimate your travel expenses and plan smarter."
          />

          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="AI Itinerary"
            description="Let AI create a personalized travel plan."
          />

          <FeatureCard
            icon={<Sparkles className="h-6 w-6" />}
            title="AI Chatbot"
            description="Ask YatraAI anything about your trip."
          />
        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
          © 2026 YatraAI. Your Journey. Your Plan. Your AI.
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
        {icon}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PLACE CARD
========================================================= */

function PlaceCard({
  place,
}: {
  place: PlaceWithImage;
}) {
  const [imageError, setImageError] = useState(false);

  const fallbackImage =
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE */}

      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-sky-100 to-slate-100">
        {place.image && !imageError ? (
          <img
            src={place.image}
            alt={place.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            loading="lazy"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : !imageError && !place.image ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <ImageOff className="h-10 w-10" />

            <span className="mt-2 text-sm">
              Image unavailable
            </span>
          </div>
        ) : (
          <img
            src={fallbackImage}
            alt="Travel destination"
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-slate-700 shadow">
          {place.type.replaceAll("_", " ")}
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {place.name}
        </h3>

        {place.address && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-500">
            {place.address}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <Navigation className="h-4 w-4" />
            View Map
          </a>

          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY MESSAGE
========================================================= */

function EmptyMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

export default App;