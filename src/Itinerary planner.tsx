import { useState } from "react";
import {
  CalendarDays,
  MapPin,
  Wallet,
  Sparkles,
  Loader2,
  Utensils,
  Navigation,
} from "lucide-react";

const API_BASE = "http://localhost:5000";

interface ItineraryPlannerProps {
  destination?: string;
}

interface ItineraryPlannerForm {
  destination: string;
  days: number;
  budget: string;
  travelType: string;
  interests: string;
}

export default function ItineraryPlanner({
  destination = "",
}: ItineraryPlannerProps) {
  const [form, setForm] = useState<ItineraryPlannerForm>({
    destination,
    days: 3,
    budget: "moderate",
    travelType: "general",
    interests: "",
  });

  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (
    field: keyof ItineraryPlannerForm,
    value: string | number
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const generateItinerary = async () => {
    if (!form.destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    setLoading(true);
    setError("");
    setItinerary("");

    try {
      const response = await fetch(
        `${API_BASE}/api/ai/itinerary`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            destination: form.destination.trim(),
            days: form.days,
            budget: form.budget,
            travelType: form.travelType,
            interests: form.interests,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to generate the itinerary."
        );
      }

      setItinerary(
        data?.itinerary ||
          "No itinerary was returned."
      );
    } catch (err) {
      console.error("Itinerary error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Sparkles size={25} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          AI Itinerary Planner
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Create a personalized travel plan with Yatra AI.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        
        {/* Destination */}
        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Destination
          </label>

          <div className="relative">
            <MapPin
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={form.destination}
              onChange={(event) =>
                updateForm(
                  "destination",
                  event.target.value
                )
              }
              placeholder="Enter destination"
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Days and Budget */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          
          {/* Number of days */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Number of Days
            </label>

            <div className="relative">
              <CalendarDays
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={form.days}
                onChange={(event) =>
                  updateForm(
                    "days",
                    Number(event.target.value)
                  )
                }
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value={1}>1 Day</option>
                <option value={2}>2 Days</option>
                <option value={3}>3 Days</option>
                <option value={4}>4 Days</option>
                <option value={5}>5 Days</option>
                <option value={6}>6 Days</option>
                <option value={7}>7 Days</option>
                <option value={10}>10 Days</option>
                <option value={14}>14 Days</option>
              </select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Budget
            </label>

            <div className="relative">
              <Wallet
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={form.budget}
                onChange={(event) =>
                  updateForm(
                    "budget",
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="budget">
                  Budget Friendly
                </option>

                <option value="moderate">
                  Moderate
                </option>

                <option value="premium">
                  Premium
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Travel type */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Travel Type
          </label>

          <select
            value={form.travelType}
            onChange={(event) =>
              updateForm(
                "travelType",
                event.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="general">
              General
            </option>

            <option value="family">
              Family Trip
            </option>

            <option value="friends">
              Friends Trip
            </option>

            <option value="solo">
              Solo Trip
            </option>

            <option value="couple">
              Couple Trip
            </option>

            <option value="adventure">
              Adventure
            </option>

            <option value="relaxation">
              Relaxation
            </option>

            <option value="cultural">
              Cultural & Heritage
            </option>
          </select>
        </div>

        {/* Interests */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Interests
          </label>

          <input
            type="text"
            value={form.interests}
            onChange={(event) =>
              updateForm(
                "interests",
                event.target.value
              )
            }
            placeholder="Example: temples, beaches, food, shopping"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={generateItinerary}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2
                size={20}
                className="animate-spin"
              />
              Creating your itinerary...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate AI Itinerary
            </>
          )}
        </button>
      </div>

      {/* Generated itinerary */}
      {itinerary && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          
          <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Navigation size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Your AI Travel Itinerary
              </h3>

              <p className="text-xs text-gray-500">
                Based on available tourism data
              </p>
            </div>
          </div>

          <div className="p-5">
            <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
              {itinerary}
            </div>
          </div>

          {/* General reminder */}
          <div className="flex gap-3 border-t border-gray-200 bg-blue-50 px-5 py-4">
            <Utensils
              size={18}
              className="mt-1 shrink-0 text-blue-600"
            />

            <p className="text-xs leading-5 text-blue-800">
              Place, restaurant, price and timing information
              should be checked against the latest available
              tourism data before travelling.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}