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
  Phone,
  Globe,
  Compass,
  ArrowRight,
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
  image?: string | null;
  wikipedia?: string;
  wikimedia_commons?: string;
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
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [places, setPlaces] = useState<PlaceWithImage[]>([]);
  const [error, setError] = useState("");
  const [imagesLoading, setImagesLoading] = useState(false);

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

      const placesResponse = await fetch(
        `${API_BASE}/api/places?lat=${searchData.lat}&lon=${searchData.lon}`
      );

      const placesData = await placesResponse.json();

      if (!placesResponse.ok) {
        throw new Error(
          placesData.error || "Unable to load nearby places."
        );
      }

      const realPlaces: PlaceWithImage[] = placesData.places || [];

      setPlaces(realPlaces);

      await loadPlaceImages(
        realPlaces,
        searchData.name || destination.trim()
      );
    } catch (error) {
      console.error("Search error:", error);

      setError(
        "Unable to load destination information. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  const loadPlaceImages = async (
    placesToLoad: PlaceWithImage[],
    destinationName: string
  ) => {
    setImagesLoading(true);
    try {
      const updatedPlaces: PlaceWithImage[] = [];

      for (const place of placesToLoad) {
        try {
          if (place.image) {
            updatedPlaces.push(place);
            continue;
          }

          const query = [
            place.name,
            place.type.replace(/_/g, " "),
            destinationName,
          ]
            .filter(Boolean)
            .join(" ");

          const response = await fetch(
            `${API_BASE}/api/image?q=${encodeURIComponent(
              query
            )}&type=${encodeURIComponent(
              place.type
            )}&destination=${encodeURIComponent(
              destinationName
            )}`
          );

          if (!response.ok) {
            updatedPlaces.push({
              ...place,
              image: null,
            });

            continue;
          }

          const data = await response.json();

          updatedPlaces.push({
            ...place,
            image: data.image || null,
          });
        } catch (imageError) {
          console.error(
            `Image loading failed for ${place.name}:`,
            imageError
          );

          updatedPlaces.push({
            ...place,
            image: null,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      setPlaces(updatedPlaces);
    } finally {
      setImagesLoading(false);
    }
  };

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

  const cafes = places.filter((place) => place.type === "cafe");

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE] to-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#00B4D8] selection:text-white overflow-x-hidden">
      {/* KANYAKUMARI CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] w-full flex flex-col justify-between overflow-hidden bg-[#0A192F]">
        {/* HERO BACKGROUND IMAGE LAYER */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
          style={{
            backgroundImage: `
              linear-gradient(180deg, rgba(10, 25, 47, 0.4) 0%, rgba(10, 25, 47, 0.25) 40%, rgba(10, 25, 47, 0.85) 100%),
              linear-gradient(90deg, rgba(10, 25, 47, 0.5) 0%, rgba(10, 25, 47, 0) 35%, rgba(10, 25, 47, 0) 65%, rgba(10, 25, 47, 0.4) 100%),
              url('public/t.jpg'),
            
            `
          }}
        />

        {/* FLOATING GLASS NAVIGATION BAR */}
        <nav className="relative z-20 px-4 pt-6 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/30 bg-white/20 px-8 py-3.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#0077B6] to-[#00B4D8] text-white shadow-md shadow-[#00B4D8]/30 transition duration-300 group-hover:scale-105">
                <Compass className="h-5 w-5 text-white" />
              </div>

              <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                Yatra<span className="text-[#00F0FF]">AI</span>
              </span>
            </div>

            <div className="hidden items-center gap-8 text-sm font-bold text-white/90 drop-shadow md:flex">
              <a href="#places" className="transition-colors hover:text-[#00F0FF]">
                Explore
              </a>
              <a href="#hotels" className="transition-colors hover:text-[#00F0FF]">
                Hotels
              </a>
              <a href="#restaurants" className="transition-colors hover:text-[#00F0FF]">
                Restaurants
              </a>
              <a href="#features" className="transition-colors hover:text-[#00F0FF]">
                Trip Planner
              </a>
            </div>

            <button
              type="button"
              className="rounded-full bg-white/20 hover:bg-white/30 border border-white/40 px-6 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* HERO MAIN CONTENT */}
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-12 text-center my-auto">
          {/* Glassmorphism AI Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-5 py-2 text-xs font-extrabold tracking-wide text-white shadow-lg backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-[#00F0FF] animate-pulse" />
            AI-Powered Travel Assistant
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl drop-shadow-xl">
            Your Journey.
            <br />
            Your Plan. <span className="text-[#00F0FF] drop-shadow-[0_4px_16px_rgba(0,240,255,0.7)]">Your AI.</span>
          </h1>

          {/* Subtitle Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-100 drop-shadow-md sm:text-lg">
            Search any destination and discover real tourist places, accommodation, restaurants, weather, routes, budgets and AI-powered travel guidance in one place.
          </p>

          {/* PREMIUM SEARCH BOX CONTAINER */}
          <div className="mx-auto mt-10 w-full max-w-3xl">
            <div className="relative flex flex-col gap-3 rounded-full border border-white/60 bg-white/90 p-2.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/50 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3.5 px-5">
                <MapPin className="h-6 w-6 text-[#00B4D8] shrink-0" />

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
                  className="w-full bg-transparent py-3 text-base font-bold text-[#0F172A] outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#00B4D8] to-[#0077B6] px-9 py-3.5 text-base font-bold text-white shadow-lg shadow-[#00B4D8]/40 transition-all duration-300 hover:opacity-95 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Search className="h-5 w-5" />
                )}

                {searching ? "Searching..." : "Explore"}
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white drop-shadow-md">
              <span className="opacity-90">Popular Destinations:</span>
              {["Chennai", "Madurai", "Kanyakumari", "Ooty", "Goa"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setDestination(city);
                    setError("");
                  }}
                  className="rounded-full bg-white/20 border border-white/30 px-3.5 py-1 text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#0F172A] hover:scale-105"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-400 bg-red-600/80 p-4 text-sm font-bold text-white shadow-xl backdrop-blur-md">
              {error}
            </div>
          )}
        </div>

        {/* SMOOTH CURVED WAVE TRANSITION */}
        <div className="pointer-events-none relative w-full leading-none z-10">
          <svg 
            className="relative block w-full h-16 sm:h-20 text-[#F0F9FF]" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0 C150,90 350,-40 500,65 C650,170 900,10 1200,40 L1200,120 L0,120 Z" 
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </section>

      {/* SEARCH RESULTS & TRAVEL DASHBOARD */}
      {searchResult && (
        <section className="relative py-12">
          {/* Subtle Background Glows */}
          <div className="pointer-events-none absolute left-10 top-20 h-96 w-96 rounded-full bg-[#00B4D8]/15 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-1/2 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6">
            {/* DESTINATION HEADER & STAT CARDS */}
            <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#00B4D8]">
                  <MapPin className="h-4 w-4" />
                  DESTINATION OVERVIEW
                </div>

                <h2 className="mt-1 text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">
                  Explore <span className="bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">{searchResult.name}</span>
                </h2>

                <p className="mt-2 max-w-xl text-sm font-medium text-slate-500">
                  {searchResult.display_name}
                </p>
              </div>

              {/* STAT CARDS */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard
                  icon={<MapPin className="h-5 w-5" />}
                  label="Tourist Places"
                  value={touristPlaces.length}
                />
                <StatCard
                  icon={<Hotel className="h-5 w-5" />}
                  label="Hotels"
                  value={hotels.length}
                />
                <StatCard
                  icon={<Utensils className="h-5 w-5" />}
                  label="Restaurants"
                  value={restaurants.length}
                />
                <StatCard
                  icon={<CloudSun className="h-5 w-5" />}
                  label="Cafes"
                  value={cafes.length}
                />
              </div>
            </div>

            {/* TOURIST PLACES SECTION */}
            <section id="places" className="mb-20">
              <SectionHeader
                title="Tourist Places"
                description="Real attraction places found near your destination."
              />

              {touristPlaces.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {touristPlaces.slice(0, 12).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No tourist places found in this area." />
              )}
            </section>

            {/* HOTELS SECTION */}
            <section id="hotels" className="mb-20">
              <SectionHeader
                title="Hotels & Accommodation"
                description="Real accommodation places found nearby."
              />

              {hotels.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {hotels.slice(0, 12).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No hotels found in this area." />
              )}
            </section>

            {/* RESTAURANTS SECTION */}
            <section id="restaurants" className="mb-20">
              <SectionHeader
                title="Restaurants & Dining"
                description="Real restaurants and food places nearby."
              />

              {restaurants.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {restaurants.slice(0, 12).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No restaurants found in this area." />
              )}
            </section>

            {/* MAP SECTION */}
            <section className="relative mb-12 rounded-3xl border border-white bg-white/80 p-8 shadow-xl backdrop-blur-md">
              <SectionHeader
                title="Explore on Map"
                description="View the searched destination and nearby places in real-time."
              />

              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md">
                <iframe
                  title="YatraAI destination map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    Number(searchResult.lon) - 0.08
                  }%2C${
                    Number(searchResult.lat) - 0.08
                  }%2C${
                    Number(searchResult.lon) + 0.08
                  }%2C${
                    Number(searchResult.lat) + 0.08
                  }&layer=mapnik&marker=${
                    searchResult.lat
                  }%2C${searchResult.lon}`}
                  className="h-[460px] w-full border-0 transition-opacity duration-300 group-hover:opacity-95"
                  loading="lazy"
                />
              </div>

              <div className="mt-5 flex justify-end">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${searchResult.lat},${searchResult.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#00B4D8] px-7 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#0096C7] hover:shadow-lg hover:scale-[1.01]"
                >
                  <Navigation className="h-4 w-4" />
                  Open Google Maps
                </a>
              </div>
            </section>
          </div>
        </section>
      )}

      {/* FEATURE CARDS */}
      {!searchResult && (
        <section id="features" className="relative py-24">
          <div className="pointer-events-none absolute right-1/4 top-10 h-80 w-80 rounded-full bg-[#00B4D8]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00B4D8]">
                <Sparkles className="h-4 w-4" />
                EVERYTHING YOU NEED
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                Your Complete Travel Companion
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-500">
                YatraAI brings intelligent travel planning, real-time context, and destination discovery into one unified platform.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<CloudSun className="h-6 w-6 text-[#00B4D8]" />}
                title="Live Weather"
                description="Check weather information and forecasts for your upcoming destination."
              />

              <FeatureCard
                icon={<Navigation className="h-6 w-6 text-cyan-600" />}
                title="Routes & Maps"
                description="Find pinpoint locations and calculate smooth travel routes effortlessly."
              />

              <FeatureCard
                icon={<Wallet className="h-6 w-6 text-emerald-600" />}
                title="Budget Planner"
                description="Optimize travel expenses and plan itineraries based on your budget."
              />

              <FeatureCard
                icon={<Sparkles className="h-6 w-6 text-amber-500" />}
                title="AI Travel Guide"
                description="Get personalized, intelligent travel recommendations with Gemini AI."
              />
            </div>
          </div>
        </section>
      )}

      {/* FLOATING IMAGE LOADING BADGE */}
      {imagesLoading && searchResult && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-slate-800/80 bg-[#0F172A]/95 px-6 py-3.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md">
          <Loader2 className="h-4 w-4 animate-spin text-[#00F0FF]" />
          Fetching high-res place photos...
        </div>
      )}
    </main>
  );
}

/* =========================================================
SECTION HEADER COMPONENT
========================================================= */
function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-2 border-l-4 border-[#00B4D8] pl-4 sm:flex-row sm:items-end">
      <div>
        <h3 className="text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">
          {title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p>
      </div>
    </div>
  );
}

/* =========================================================
STAT CARD COMPONENT
========================================================= */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white bg-white/80 p-5 text-center shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E0F7FA] text-[#00B4D8]">
        {icon}
      </div>
      <p className="text-2xl font-black tracking-tight text-[#0F172A]">{value}</p>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

/* =========================================================
PLACE CARD COMPONENT
========================================================= */
function PlaceCard({ place }: { place: PlaceWithImage }) {
  const [imageError, setImageError] = useState(false);
  const imageAvailable = Boolean(place.image) && !imageError;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        {imageAvailable ? (
          <img
            src={place.image || ""}
            alt={`${place.name} photo`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-tr from-sky-50 via-slate-100 to-cyan-50 text-slate-400">
            <ImageOff className="h-8 w-8 text-slate-400" />
            <span className="mt-2 text-xs font-semibold text-slate-400">
              Photo unavailable
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-[#00B4D8] px-3 py-1 text-[10px] font-extrabold capitalize tracking-wider text-white shadow-md">
          {place.type.replace(/_/g, " ")}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h4 className="line-clamp-2 text-base font-bold tracking-tight text-[#0F172A] transition-colors group-hover:text-[#00B4D8]">
            {place.name}
          </h4>

          {place.address && (
            <div className="mt-2.5 flex items-start gap-1.5 text-xs font-medium text-slate-500">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00B4D8]" />
              <span className="line-clamp-2">{place.address}</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#00B4D8] py-2 px-3 text-xs font-bold text-white shadow-sm transition duration-200 hover:bg-[#0096C7]"
          >
            <Navigation className="h-3.5 w-3.5" />
            Directions
          </a>

          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              title="Call"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
          )}

          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              title="Website"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
FEATURE CARD COMPONENT
========================================================= */
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white bg-white/80 p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 p-3 transition duration-300 group-hover:scale-110">
        {icon}
      </div>

      <h4 className="text-lg font-bold text-[#0F172A]">{title}</h4>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#00B4D8] opacity-0 transition-opacity group-hover:opacity-100">
        Explore feature <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

/* =========================================================
EMPTY STATE COMPONENT
========================================================= */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <MapPin className="h-6 w-6 text-slate-400" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}

export default App;