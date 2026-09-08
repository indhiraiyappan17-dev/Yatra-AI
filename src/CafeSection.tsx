import {
  MapPin,
  Navigation,
  Phone,
  Globe,
  ImageOff,
  Coffee,
} from "lucide-react";

export type Cafe = {
  id: number | string;
  name: string;
  type?: string;
  lat: number;
  lon: number;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  image?: string | null;
};

type CafeSectionProps = {
  cafes: Cafe[];
};

function CafeSection({
  cafes,
}: CafeSectionProps) {
  return (
    <section id="cafes" className="mt-14">
      {/* SECTION HEADER */}

      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
          <Coffee className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Cafes
          </h2>

          <p className="mt-1 text-slate-500">
            Nearby cafes available in the real map data.
          </p>
        </div>
      </div>

      {/* CAFE LIST */}

      {cafes.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cafes.slice(0, 9).map((cafe) => (
            <CafeCard
              key={`${cafe.id}-${cafe.name}`}
              cafe={cafe}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No cafes were found in the available
          OpenStreetMap data.
        </div>
      )}
    </section>
  );
}

/* =========================================================
   CAFE CARD
========================================================= */

function CafeCard({
  cafe,
}: {
  cafe: Cafe;
}) {
  const mapsUrl =
    `https://www.google.com/maps/search/?api=1&query=` +
    `${cafe.lat},${cafe.lon}`;

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=` +
    `${cafe.lat},${cafe.lon}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* IMAGE */}

      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-sky-100 to-slate-100">
        {cafe.image ? (
          <img
            src={cafe.image}
            alt={cafe.name}
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

        {/* BADGE */}

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-slate-700 shadow">
          Cafe
        </div>
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900">
          {cafe.name}
        </h3>

        {/* ADDRESS */}

        {cafe.address && (
          <div className="mt-3 flex gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

            <p className="line-clamp-2">
              {cafe.address}
            </p>
          </div>
        )}

        {/* PHONE */}

        {cafe.phone && (
          <a
            href={`tel:${cafe.phone}`}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600"
          >
            <Phone className="h-4 w-4" />
            {cafe.phone}
          </a>
        )}

        {/* ACTION BUTTONS */}

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <MapPin className="h-4 w-4" />
            View Map
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </a>
        </div>

        {/* WEBSITE */}

        {cafe.website && (
          <a
            href={cafe.website}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
          >
            <Globe className="h-4 w-4" />
            Website
          </a>
        )}

        {/* SOURCE */}

        <p className="mt-4 text-xs text-slate-400">
          Source: OpenStreetMap
        </p>
      </div>
    </div>
  );
}

export default CafeSection;