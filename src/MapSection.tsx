import React from "react";

export interface TouristPlace {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  website?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  description?: string | null;
  mapsUrl?: string | null;
  directionsUrl?: string | null;
  image?: string | null;
  imageSource?: string | null;
  imageSourceUrl?: string | null;
  source?: string;
  osmType?: string;
  osmId?: number;
}

interface MapSectionProps {
  places: TouristPlace[];
  selectedPlace?: TouristPlace | null;
  onSelectPlace?: (place: TouristPlace) => void;
}

export default function MapSection({
  places,
  selectedPlace,
  onSelectPlace,
}: MapSectionProps) {
  const validPlaces = places.filter(
    (place) =>
      place.latitude !== null &&
      place.longitude !== null
  );

  if (validPlaces.length === 0) {
    return (
      <section className="map-section">
        <div className="map-empty">
          <h3>No map locations available</h3>
          <p>
            Real location coordinates are not available
            for the selected places.
          </p>
        </div>
      </section>
    );
  }

  const firstPlace =
    selectedPlace &&
    selectedPlace.latitude !== null &&
    selectedPlace.longitude !== null
      ? selectedPlace
      : validPlaces[0];

  const mapUrl =
    `https://www.openstreetmap.org/export/embed.html?` +
    `bbox=${firstPlace.longitude! - 0.05},` +
    `${firstPlace.latitude! - 0.05},` +
    `${firstPlace.longitude! + 0.05},` +
    `${firstPlace.latitude! + 0.05}&` +
    `layer=mapnik&marker=` +
    `${firstPlace.latitude},${firstPlace.longitude}`;

  return (
    <section className="map-section">
      <div className="map-header">
        <div>
          <h2>Explore on Map</h2>

          <p>
            {validPlaces.length} real places found
          </p>
        </div>
      </div>

      <div className="map-container">
        <iframe
          title="Tourist places map"
          src={mapUrl}
          className="tourist-map"
          loading="lazy"
        />
      </div>

      <p className="map-attribution">
        Map data © OpenStreetMap contributors
      </p>

      <div className="map-place-list">
        {validPlaces.map((place) => {
          const isSelected =
            selectedPlace?.id === place.id;

          return (
            <button
              key={place.id}
              type="button"
              className={`map-place ${
                isSelected
                  ? "map-place-selected"
                  : ""
              }`}
              onClick={() =>
                onSelectPlace?.(place)
              }
            >
              <div className="map-place-info">
                <strong>
                  {place.name}
                </strong>

                <span>
                  {place.type}
                </span>

                <small>
                  {place.address}
                </small>
              </div>

              {place.directionsUrl && (
                <a
                  href={place.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="directions-button"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  Get Directions
                </a>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}