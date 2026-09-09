import React, { useEffect, useState } from "react";
import {
  Hotel,
  MapPin,
  Phone,
  Globe,
  Navigation,
  ExternalLink,
  BedDouble,
  Star,
  Loader2,
} from "lucide-react";

export type HotelData = {
  id: string;
  name: string;
  type: string;
  category: string;

  latitude: number;
  longitude: number;

  address: string;

  phone: string | null;
  website: string | null;
  image: string | null;

  stars: string | null;
  rooms: string | null;
  beds: string | null;

  operator: string | null;
  openingHours: string | null;

  googleMapsUrl: string;
  directionsUrl: string;
  openStreetMapUrl: string;
  bookingSearchUrl: string;

  source: string;
};

type HotelSectionProps = {
  latitude: number;
  longitude: number;

  destinationName?: string;

  onHotelSelect?: (hotel: HotelData) => void;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";


function getHotelType(type: string) {
  const types: Record<string, string> = {
    hotel: "Hotel",
    guest_house: "Guest House",
    hostel: "Hostel",
    motel: "Motel",
    apartment: "Apartment",
    chalet: "Chalet",
    resort: "Resort",
    camp_site: "Camp Site",
    caravan_site: "Caravan Site",
  };

  return types[type] || "Accommodation";
}


function HotelCard({
  hotel,
  onSelect,
}: {
  hotel: HotelData;
  onSelect?: (hotel: HotelData) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg">
      
      {/* IMAGE */}
      <div className="relative h-48 w-full bg-gray-100">
        {hotel.image ? (
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <Hotel size={42} />
            <span className="mt-2 text-sm">
              No verified image available
            </span>
          </div>
        )}

        {/* TYPE */}
        <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
          {getHotelType(hotel.type)}
        </div>
      </div>


      {/* CONTENT */}
      <div className="p-5">

        <h3 className="text-lg font-bold text-gray-900">
          {hotel.name}
        </h3>


        {/* ADDRESS */}
        <div className="mt-3 flex gap-2 text-sm text-gray-600">
          <MapPin
            size={17}
            className="mt-0.5 shrink-0"
          />

          <span>
            {hotel.address}
          </span>
        </div>


        {/* PHONE */}
        {hotel.phone && (
          <div className="mt-2 flex gap-2 text-sm text-gray-600">
            <Phone
              size={17}
              className="mt-0.5 shrink-0"
            />

            <a
              href={`tel:${hotel.phone}`}
              className="hover:underline"
            >
              {hotel.phone}
            </a>
          </div>
        )}


        {/* OSM INFORMATION */}
        {(hotel.stars ||
          hotel.rooms ||
          hotel.beds) && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">

            {hotel.stars && (
              <span className="flex items-center gap-1">
                <Star size={16} />
                {hotel.stars} stars
              </span>
            )}

            {hotel.rooms && (
              <span className="flex items-center gap-1">
                <Hotel size={16} />
                {hotel.rooms} rooms
              </span>
            )}

            {hotel.beds && (
              <span className="flex items-center gap-1">
                <BedDouble size={16} />
                {hotel.beds} beds
              </span>
            )}

          </div>
        )}


        {/* BUTTONS */}
        <div className="mt-5 flex flex-wrap gap-2">

          <a
            href={hotel.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <MapPin size={16} />
            Maps
          </a>


          <a
            href={hotel.directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Navigation size={16} />
            Directions
          </a>


          {hotel.website && (
            <a
              href={hotel.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Globe size={16} />
              Website
            </a>
          )}


          <a
            href={hotel.bookingSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <ExternalLink size={16} />
            Search Booking
          </a>

        </div>


        {/* DETAILS */}
        {onSelect && (
          <button
            onClick={() => onSelect(hotel)}
            className="mt-3 w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            View Hotel Details
          </button>
        )}


        {/* SOURCE */}
        <p className="mt-4 text-xs text-gray-400">
          Data source: {hotel.source}
        </p>

      </div>
    </div>
  );
}


export default function HotelSection({
  latitude,
  longitude,
  destinationName,
  onHotelSelect,
}: HotelSectionProps) {

  const [hotels, setHotels] = useState<HotelData[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {

    async function fetchHotels() {

      try {

        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/hotels?lat=${latitude}&lon=${longitude}`
        );


        if (!response.ok) {
          throw new Error(
            "Failed to fetch hotels"
          );
        }


        const result = await response.json();


        if (!result.success) {
          throw new Error(
            result.message ||
              "Unable to load hotels"
          );
        }


        setHotels(
          result.hotels ||
          result.data ||
          []
        );

      } catch (err) {

        console.error(
          "Hotel fetch error:",
          err
        );

        setError(
          "Unable to load real accommodation data."
        );

      } finally {

        setLoading(false);

      }
    }


    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      fetchHotels();
    }

  }, [latitude, longitude]);


  return (
    <section className="mt-8">

      {/* HEADER */}
      <div className="mb-6">

        <div className="flex items-center gap-2">

          <Hotel size={26} />

          <h2 className="text-2xl font-bold">
            Hotels & Accommodation
          </h2>

        </div>


        {destinationName && (
          <p className="mt-1 text-sm text-gray-500">
            Real accommodation options near{" "}
            {destinationName}
          </p>
        )}

      </div>


      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-500">

          <Loader2
            size={28}
            className="mr-2 animate-spin"
          />

          <span>
            Finding real accommodations...
          </span>

        </div>
      )}


      {/* ERROR */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* NO RESULTS */}
      {!loading &&
        !error &&
        hotels.length === 0 && (
          <div className="rounded-xl border bg-gray-50 p-8 text-center">

            <Hotel
              size={40}
              className="mx-auto text-gray-400"
            />

            <p className="mt-3 font-medium text-gray-700">
              No mapped accommodations found nearby.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              The OpenStreetMap database may not
              have hotel data for this location.
            </p>

          </div>
        )}


      {/* HOTEL GRID */}
      {!loading &&
        !error &&
        hotels.length > 0 && (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onSelect={onHotelSelect}
              />
            ))}

          </div>
        )}


      {/* SOURCE NOTE */}
      {!loading &&
        hotels.length > 0 && (
          <p className="mt-5 text-xs text-gray-400">
            Hotel information is retrieved from
            OpenStreetMap via the Overpass API.
            Prices and live room availability are
            not fabricated.
          </p>
        )}

    </section>
  );
}