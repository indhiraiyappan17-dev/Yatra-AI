import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Globe,
  Navigation,
  ExternalLink,
  Building2,
  ArrowLeft,
} from "lucide-react";

type Hotel = {
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

type HotelDetailProps = {
  hotel: Hotel;
  onBack?: () => void;
};

export default function HotelDetail({
  hotel,
  onBack,
}: HotelDetailProps) {
  const [details, setDetails] = useState<Hotel>(hotel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          lat: String(hotel.latitude),
          lon: String(hotel.longitude),
          name: hotel.name,
        });

        const response = await fetch(
          `http://localhost:5000/api/hotels/detail?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch hotel details");
        }

        const result = await response.json();

        if (result.success && result.hotel) {
          setDetails(result.hotel);
        }
      } catch (err) {
        console.error("Hotel detail error:", err);
        setError(
          "Live details could not be loaded. Showing available information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotel]);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-5 flex items-center gap-2 text-gray-700 hover:text-black font-medium"
        >
          <ArrowLeft size={20} />
          Back to Hotels
        </button>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Hotel Image */}
        <div className="w-full h-64 md:h-80 bg-gray-100 flex items-center justify-center">
          {details.image ? (
            <img
              src={details.image}
              alt={details.name}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Building2 size={55} />
              <p className="mt-2">No hotel image available</p>
            </div>
          )}
        </div>

        {/* Hotel Information */}
        <div className="p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {details.category}
              </p>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                {details.name}
              </h1>

              {details.operator && (
                <p className="text-gray-600 mt-2">
                  Operated by {details.operator}
                </p>
              )}
            </div>

            {details.stars && (
              <div className="px-4 py-2 bg-gray-100 rounded-lg font-semibold">
                {details.stars} Star
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <p className="mt-4 text-sm text-gray-500">
              Loading latest hotel details...
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-orange-600">
              {error}
            </p>
          )}

          {/* Details */}
          <div className="mt-7 space-y-5">

            {/* Address */}
            <div className="flex gap-4">
              <div className="mt-1">
                <MapPin size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Address
                </h3>

                <p className="text-gray-600 mt-1">
                  {details.address}
                </p>
              </div>
            </div>

            {/* Phone */}
            {details.phone && (
              <div className="flex gap-4">
                <div className="mt-1">
                  <Phone size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Phone
                  </h3>

                  <a
                    href={`tel:${details.phone}`}
                    className="text-gray-600 hover:underline"
                  >
                    {details.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Website */}
            {details.website && (
              <div className="flex gap-4">
                <div className="mt-1">
                  <Globe size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Website
                  </h3>

                  <a
                    href={details.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    Visit official website
                  </a>
                </div>
              </div>
            )}

            {/* Rooms */}
            {details.rooms && (
              <div className="flex gap-4">
                <div className="mt-1">
                  <Building2 size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Rooms
                  </h3>

                  <p className="text-gray-600">
                    {details.rooms}
                  </p>
                </div>
              </div>
            )}

            {/* Opening Hours */}
            {details.openingHours && (
              <div className="flex gap-4">
                <div className="mt-1">
                  <Globe size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Opening Hours
                  </h3>

                  <p className="text-gray-600">
                    {details.openingHours}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="mt-8 p-5 bg-gray-50 rounded-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Location
            </h2>

            <p className="text-sm text-gray-600">
              Latitude: {details.latitude}
            </p>

            <p className="text-sm text-gray-600">
              Longitude: {details.longitude}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* Google Maps */}
            <a
              href={details.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black text-white hover:opacity-90 transition"
            >
              <MapPin size={19} />
              Google Maps
            </a>

            {/* Directions */}
            <a
              href={details.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-800 text-white hover:opacity-90 transition"
            >
              <Navigation size={19} />
              Get Directions
            </a>

            {/* Website */}
            {details.website && (
              <a
                href={details.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
              >
                <Globe size={19} />
                Website
              </a>
            )}

            {/* Booking Search */}
            <a
              href={details.bookingSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            >
              <ExternalLink size={19} />
              Search Booking
            </a>

            {/* OpenStreetMap */}
            <a
              href={details.openStreetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            >
              <ExternalLink size={19} />
              OpenStreetMap
            </a>
          </div>

          {/* Data Source */}
          <div className="mt-7 pt-5 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Accommodation data source: {details.source}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Hotel information is displayed only when available from
              the real data source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}