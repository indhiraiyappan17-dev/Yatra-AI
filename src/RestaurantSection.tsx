import {
  MapPin,
  Navigation,
  Phone,
  Globe,
  ImageOff,
  Utensils,
} from "lucide-react";

export type Restaurant = {
  id: string;
  name: string;
  cuisine?: string | null;
  foodType?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  phone?: string | null;
  website?: string | null;
  openingHours?: string | null;
  googleMapsUrl?: string | null;
  directionsUrl?: string | null;
  image?: string | null;
  source?: string;
};

type RestaurantSectionProps = {
  restaurants: Restaurant[];
};

function RestaurantSection({
  restaurants,
}: RestaurantSectionProps) {
  return (
    <section id="restaurants" className="mt-14">
      {/* SECTION HEADER */}

      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
          <Utensils className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Restaurants
          </h2>

          <p className="mt-1 text-slate-500">
            Real restaurants and food options nearby.
          </p>
        </div>
      </div>

      {/* RESTAURANT LIST */}

      {restaurants.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.slice(0, 12).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No restaurants were found in the available
          OpenStreetMap data.
        </div>
      )}
    </section>
  );
}

/* =========================================================
   RESTAURANT CARD
========================================================= */

function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const imageAvailable = Boolean(restaurant.image);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE */}

      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-sky-100 to-slate-100">
        {imageAvailable ? (
          <img
            src={restaurant.image || ""}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <ImageOff className="h-10 w-10" />

            <span className="mt-2 text-sm">
              Image unavailable
            </span>
          </div>
        )}

        {/* REAL DATA BADGE */}

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
          Real restaurant
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {restaurant.name}
        </h3>

        {/* CUISINE */}

        {restaurant.cuisine && (
          <p className="mt-2 text-sm font-medium capitalize text-sky-600">
            {restaurant.cuisine.replaceAll("_", " ")}
          </p>
        )}

        {/* FOOD TYPE */}

        {restaurant.foodType && (
          <p className="mt-1 text-sm text-slate-500">
            {restaurant.foodType}
          </p>
        )}

        {/* ADDRESS */}

        {restaurant.address && (
          <div className="mt-3 flex gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

            <p className="line-clamp-2">
              {restaurant.address}
            </p>
          </div>
        )}

        {/* PHONE */}

        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone}`}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600"
          >
            <Phone className="h-4 w-4" />
            {restaurant.phone}
          </a>
        )}

        {/* OPENING HOURS */}

        {restaurant.openingHours && (
          <p className="mt-2 line-clamp-2 text-xs text-slate-400">
            {restaurant.openingHours}
          </p>
        )}

        {/* ACTION BUTTONS */}

        <div className="mt-5 flex flex-wrap gap-2">
          {restaurant.googleMapsUrl && (
            <a
              href={restaurant.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <MapPin className="h-4 w-4" />
              View Map
            </a>
          )}

          {restaurant.directionsUrl && (
            <a
              href={restaurant.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Navigation className="h-4 w-4" />
              Directions
            </a>
          )}
        </div>

        {/* WEBSITE */}

        {restaurant.website && (
          <a
            href={restaurant.website}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            <Globe className="h-4 w-4" />
            Website
          </a>
        )}

        {/* SOURCE */}

        {restaurant.source && (
          <p className="mt-4 text-xs text-slate-400">
            Source: {restaurant.source}
          </p>
        )}
      </div>
    </div>
  );
}

export default RestaurantSection;