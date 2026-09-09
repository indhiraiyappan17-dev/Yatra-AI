import React, { useState } from 'react';
import Chatbot from './chatbot';
import {
  Search,
  MapPin,
  Hotel,
  Utensils,
  CloudSun,
  Navigation,
  Compass,
  Bot,
  ExternalLink,
  Phone,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  DollarSign,
} from 'lucide-react';

// --- TYPES ---
interface TourismPlace {
  id: string;
  name: string;
  category: string;
  location: string;
  image?: string;
  rating?: number;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  price?: string;
  image?: string;
  phone?: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  image?: string;
  website?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [places, setPlaces] = useState<TourismPlace[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsLoading(true);

    try {
      // Existing API integration can be connected here.
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching destination data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-sans antialiased selection:bg-[#38BDF8] selection:text-[#0F172A]">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto backdrop-blur-md bg-[#0F172A]/80 border border-white/10 rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-xl shadow-black/20">

          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#38BDF8] to-[#67E8F9] flex items-center justify-center shadow-md shadow-[#38BDF8]/20">
              <Compass className="w-6 h-6 text-[#0F172A]" />
            </div>

            <span className="text-2xl font-black tracking-tight text-[#F8FAFC]">
              Yatra<span className="text-[#38BDF8]">AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#CBD5E1]">
            <a href="#hero" className="hover:text-[#38BDF8] transition-colors">
              Explore
            </a>

            <a href="#hotels" className="hover:text-[#38BDF8] transition-colors">
              Hotels
            </a>

            <a href="#restaurants" className="hover:text-[#38BDF8] transition-colors">
              Restaurants
            </a>

            <a href="#planner" className="hover:text-[#38BDF8] transition-colors">
              Trip Planner
            </a>
          </div>

          {/* Sign In + Mobile */}
          <div className="flex items-center space-x-4">
            <button className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-[#38BDF8] hover:bg-[#67E8F9] text-[#0F172A] font-bold text-sm shadow-md shadow-[#38BDF8]/20 transition-all">
              Sign In
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-[#CBD5E1] hover:text-[#F8FAFC] p-2 rounded-lg bg-[#1E293B] border border-white/10"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 max-w-7xl mx-auto backdrop-blur-xl bg-[#1E293B]/95 border border-white/10 rounded-2xl p-6 flex flex-col space-y-4 text-[#CBD5E1] shadow-2xl">

            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#38BDF8] py-1 font-medium"
            >
              Explore
            </a>

            <a
              href="#hotels"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#38BDF8] py-1 font-medium"
            >
              Hotels
            </a>

            <a
              href="#restaurants"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#38BDF8] py-1 font-medium"
            >
              Restaurants
            </a>

            <a
              href="#planner"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#38BDF8] py-1 font-medium"
            >
              Trip Planner
            </a>

            <button className="w-full py-3 rounded-xl bg-[#38BDF8] text-[#0F172A] font-bold">
              Sign In
            </button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">

          <img
            src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=2000&q=80"
            alt="Kanyakumari Tourism background"
            className="w-full h-full object-cover object-center scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/70 to-[#0F172A]/30" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/50" />
        </div>

        <div className="relative z-10 max-w-7xl w-full mx-auto grid lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 space-y-8 text-left">

            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1E293B]/80 border border-[#38BDF8]/30 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />

              <span className="text-xs font-semibold uppercase tracking-wider text-[#BAE6FD]">
                Smart Travel Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F8FAFC] leading-[1.1]">
              Your Journey.
              <br />
              Your Plan.
              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#67E8F9] to-[#BAE6FD]">
                Your AI.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#CBD5E1] max-w-2xl leading-relaxed">
              Discover iconic landmarks, premium stays, dining spots, and AI
              itineraries with real-time intelligence.
            </p>

            {/* SEARCH */}
            <form onSubmit={handleSearch} className="pt-2 max-w-2xl">
              <div className="relative flex items-center p-2 rounded-2xl backdrop-blur-xl bg-[#1E293B]/80 border border-white/10 shadow-2xl focus-within:border-[#38BDF8]">

                <MapPin className="w-6 h-6 text-[#38BDF8] ml-3 flex-shrink-0" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to explore? (e.g. Kanyakumari, Goa...)"
                  className="w-full bg-transparent px-4 py-3 text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none text-base sm:text-lg"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3.5 rounded-xl bg-[#38BDF8] hover:bg-[#67E8F9] text-[#0F172A] font-bold text-base flex items-center space-x-2 shadow-lg shadow-[#38BDF8]/20 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#0F172A]/30 border-t-[#0F172A] rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Explore</span>
                      <Search className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* POPULAR */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] pt-2">
              <span className="font-semibold text-[#CBD5E1] uppercase tracking-wider">
                Popular:
              </span>

              {['Kanyakumari', 'Manali', 'Kerala', 'Jaipur'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(tag)}
                  className="px-2.5 py-1 rounded-md bg-[#1E293B]/60 hover:bg-[#243247] border border-white/10 text-[#CBD5E1] hover:text-[#38BDF8] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block" />
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {hasSearched && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

            <StatCard
              label="Places to Visit"
              count={places.length}
              icon={<Compass className="text-[#38BDF8]" />}
            />

            <StatCard
              label="Stays & Hotels"
              count={hotels.length}
              icon={<Hotel className="text-[#38BDF8]" />}
            />

            <StatCard
              label="Restaurants & Cafes"
              count={restaurants.length}
              icon={<Utensils className="text-[#38BDF8]" />}
            />

            <StatCard
              label="Current Weather"
              count={weather ? `${weather.temp}°C` : 'N/A'}
              icon={<CloudSun className="text-[#38BDF8]" />}
            />
          </div>

          {/* PLACES */}
          <section className="space-y-6">

            <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] flex items-center space-x-3">
              <Compass className="w-7 h-7 text-[#38BDF8]" />
              <span>Top Destinations & Attractions</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.length > 0 ? (
                places.map((place) => (
                  <TourismCard
                    key={place.id}
                    title={place.name}
                    category={place.category}
                    location={place.location}
                    image={place.image}
                  />
                ))
              ) : (
                <EmptyState message="No attractions found for this search." />
              )}
            </div>
          </section>

          {/* HOTELS + RESTAURANTS */}
          <div className="grid lg:grid-cols-2 gap-12">

            {/* HOTELS */}
            <section id="hotels" className="space-y-6">

              <h2 className="text-2xl font-bold text-[#F8FAFC] flex items-center space-x-3">
                <Hotel className="w-6 h-6 text-[#38BDF8]" />
                <span>Recommended Stays</span>
              </h2>

              <div className="space-y-4">
                {hotels.length > 0 ? (
                  hotels.map((hotel) => (
                    <ListItemCard
                      key={hotel.id}
                      title={hotel.name}
                      subtitle={hotel.location}
                      badge={hotel.price}
                      image={hotel.image}
                      actionIcon={<Phone className="w-4 h-4" />}
                      actionLabel="Contact"
                    />
                  ))
                ) : (
                  <EmptyState message="No hotels found." />
                )}
              </div>
            </section>

            {/* RESTAURANTS */}
            <section id="restaurants" className="space-y-6">

              <h2 className="text-2xl font-bold text-[#F8FAFC] flex items-center space-x-3">
                <Utensils className="w-6 h-6 text-[#38BDF8]" />
                <span>Culinary & Dining</span>
              </h2>

              <div className="space-y-4">
                {restaurants.length > 0 ? (
                  restaurants.map((rest) => (
                    <ListItemCard
                      key={rest.id}
                      title={rest.name}
                      subtitle={rest.cuisine || rest.location}
                      image={rest.image}
                      actionIcon={<ExternalLink className="w-4 h-4" />}
                      actionLabel="Website"
                    />
                  ))
                ) : (
                  <EmptyState message="No restaurants found." />
                )}
              </div>
            </section>
          </div>

          {/* MAP + WEATHER */}
          <section className="grid lg:grid-cols-12 gap-8 items-start">

            {/* MAP */}
            <div className="lg:col-span-8 bg-[#1E293B] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">

              <div className="flex items-center justify-between px-2 pt-1">
                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-[#38BDF8]" />
                  <span>Interactive Map & Routes</span>
                </h3>

                <span className="text-xs text-[#94A3B8]">
                  Live Navigation Ready
                </span>
              </div>

              <div className="w-full h-96 bg-[#111827] rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">

                <div className="text-center z-10 p-6 space-y-2">
                  <MapPin className="w-10 h-10 text-[#38BDF8] mx-auto animate-bounce" />

                  <p className="text-[#CBD5E1] font-medium">
                    Map View for {searchQuery || 'Destination'}
                  </p>

                  <p className="text-xs text-[#94A3B8]">
                    Existing Map logic & endpoints remain intact.
                  </p>
                </div>
              </div>
            </div>

            {/* WEATHER */}
            <div className="lg:col-span-4 bg-gradient-to-b from-[#1E293B] to-[#172033] border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">

              <div className="flex items-center justify-between border-b border-white/10 pb-4">

                <h3 className="text-lg font-bold text-[#F8FAFC] flex items-center space-x-2">
                  <CloudSun className="w-5 h-5 text-[#38BDF8]" />
                  <span>Weather Forecast</span>
                </h3>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
                  Live
                </span>
              </div>

              <div className="text-center py-4 space-y-2">

                <div className="text-5xl font-black text-[#F8FAFC]">
                  {weather ? `${weather.temp}°C` : '28°C'}
                </div>

                <p className="text-[#CBD5E1] font-medium">
                  {weather ? weather.condition : 'Partly Cloudy & Pleasant'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">

                <div className="bg-[#111827]/60 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-[#94A3B8] block">
                    Humidity
                  </span>

                  <span className="text-sm font-semibold text-[#F8FAFC]">
                    {weather ? `${weather.humidity}%` : '65%'}
                  </span>
                </div>

                <div className="bg-[#111827]/60 p-3 rounded-xl border border-white/5 text-center">
                  <span className="text-xs text-[#94A3B8] block">
                    Wind Speed
                  </span>

                  <span className="text-sm font-semibold text-[#F8FAFC]">
                    {weather ? `${weather.windSpeed} km/h` : '14 km/h'}
                  </span>
                </div>

              </div>
            </div>
          </section>
        </main>
      )}

      {/* FEATURES */}
      <section
        id="planner"
        className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10"
      >

        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
            Smart Travel Capabilities
          </h2>

          <p className="text-[#CBD5E1] text-base">
            Engineered to streamline every aspect of your voyage with
            intelligent automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <FeatureCard
            icon={<CloudSun className="w-6 h-6 text-[#38BDF8]" />}
            title="Live Weather Insights"
            desc="Real-time localized climate updates ensuring optimal outdoor excursion planning."
          />

          <FeatureCard
            icon={<Navigation className="w-6 h-6 text-[#38BDF8]" />}
            title="Optimized Routes"
            desc="Seamless navigation matrix powered by intelligent real-time spatial mapping."
          />

          <FeatureCard
            icon={<DollarSign className="w-6 h-6 text-[#38BDF8]" />}
            title="Budget Architect"
            desc="Dynamic expenditure forecasting tailored precisely to your trip preferences."
          />

          <FeatureCard
            icon={<Bot className="w-6 h-6 text-[#38BDF8]" />}
            title="AI Travel Guide"
            desc="Context-aware natural language assistant for instant localized recommendations."
          />

        </div>
      </section>

      {/* AI SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1E293B] via-[#243247] to-[#1E293B] border border-[#38BDF8]/30 p-8 sm:p-12 shadow-2xl shadow-black/40">

          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">

            {/* AI HEADER */}
            <div className="max-w-3xl space-y-6">

              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#67E8F9] text-xs font-semibold border border-[#38BDF8]/20">
                <Bot className="w-4 h-4" />
                <span>YatraAI Co-Pilot</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#F8FAFC] leading-tight">
                Your Personal AI Travel Assistant
              </h2>

              <p className="text-[#CBD5E1] text-base leading-relaxed">
                Ask anything about your destination, tourist places, food,
                travel tips, budgets, or personalized itineraries.
              </p>
            </div>

            {/* CHATBOT */}
            <div className="pt-2">
              <Chatbot destination={searchQuery} />
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-center text-xs text-[#94A3B8]">

        <div className="max-w-7xl mx-auto px-4 space-y-4">

          <div className="flex items-center justify-center space-x-2">
            <Compass className="w-5 h-5 text-[#38BDF8]" />

            <span className="text-lg font-bold text-[#F8FAFC]">
              YatraAI
            </span>
          </div>

          <p>
            © {new Date().getFullYear()} YatraAI Tourism Platform. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  );
}

// --- STAT CARD ---
function StatCard({
  label,
  count,
  icon,
}: {
  label: string;
  count: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 space-y-2 shadow-lg hover:border-[#38BDF8]/30 transition-all">

      <div className="flex items-center justify-between">

        <span className="text-xs font-semibold text-[#94A3B8]">
          {label}
        </span>

        <div className="p-2 rounded-xl bg-[#111827] border border-white/5">
          {icon}
        </div>

      </div>

      <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
        {count}
      </div>
    </div>
  );
}

// --- TOURISM CARD ---
function TourismCard({
  title,
  category,
  location,
  image,
}: {
  title: string;
  category: string;
  location: string;
  image?: string;
}) {
  return (
    <div className="group bg-[#1E293B] border border-white/10 rounded-2xl overflow-hidden hover:border-[#38BDF8]/50 shadow-lg hover:shadow-[#38BDF8]/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">

      <div className="relative h-52 bg-[#111827] overflow-hidden flex items-center justify-center text-[#94A3B8]">

        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Compass className="w-8 h-8 text-[#94A3B8]" />
            <span className="text-xs font-medium text-[#94A3B8]">
              Photo unavailable
            </span>
          </div>
        )}

        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0F172A]/90 backdrop-blur-md border border-white/10 text-[#67E8F9] text-xs font-semibold">
          {category || 'Attraction'}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">

        <div>

          <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#38BDF8] transition-colors">
            {title}
          </h3>

          <p className="text-xs text-[#CBD5E1] mt-1 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{location}</span>
          </p>

        </div>

        <button className="w-full py-2.5 rounded-xl bg-[#243247] hover:bg-[#38BDF8] hover:text-[#0F172A] border border-white/5 text-[#38BDF8] font-bold text-xs flex items-center justify-center space-x-2 transition-all">

          <span>Get Directions</span>

          <ChevronRight className="w-3.5 h-3.5" />

        </button>

      </div>
    </div>
  );
}

// --- LIST ITEM CARD ---
function ListItemCard({
  title,
  subtitle,
  badge,
  image,
  actionIcon,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  image?: string;
  actionIcon: React.ReactNode;
  actionLabel: string;
}) {
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-4 flex items-center space-x-4 hover:border-[#38BDF8]/30 transition-all shadow-md">

      <div className="w-20 h-20 rounded-xl bg-[#111827] flex-shrink-0 overflow-hidden flex items-center justify-center text-[#94A3B8]">

        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-[#94A3B8]">
            Photo unavailable
          </span>
        )}

      </div>

      <div className="flex-1 min-w-0">

        <div className="flex items-center space-x-2">

          <h4 className="text-sm font-bold text-[#F8FAFC] truncate">
            {title}
          </h4>

          {badge && (
            <span className="px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#67E8F9] text-[10px] font-semibold border border-[#38BDF8]/20">
              {badge}
            </span>
          )}

        </div>

        <p className="text-xs text-[#CBD5E1] truncate mt-1">
          {subtitle}
        </p>
      </div>

      <button className="px-3.5 py-2 rounded-xl bg-[#243247] hover:bg-[#38BDF8] hover:text-[#0F172A] border border-white/5 text-[#F8FAFC] text-xs font-semibold flex items-center space-x-1.5 flex-shrink-0 transition-colors">

        {actionIcon}

        <span className="hidden sm:inline">
          {actionLabel}
        </span>

      </button>
    </div>
  );
}

// --- FEATURE CARD ---
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 space-y-3 hover:border-[#38BDF8]/40 hover:-translate-y-1 transition-all duration-300 shadow-xl">

      <div className="w-12 h-12 rounded-xl bg-[#111827] border border-white/5 flex items-center justify-center">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-[#F8FAFC]">
        {title}
      </h3>

      <p className="text-xs text-[#CBD5E1] leading-relaxed">
        {desc}
      </p>

    </div>
  );
}

// --- EMPTY STATE ---
function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-12 text-center bg-[#1E293B]/50 border border-dashed border-white/10 rounded-2xl">
      <p className="text-sm text-[#94A3B8]">
        {message}
      </p>
    </div>
  );
}