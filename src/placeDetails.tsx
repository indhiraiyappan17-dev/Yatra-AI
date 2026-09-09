import React from "react";
import type { TouristPlace } from "./MapSection";

interface PlaceDetailsProps {
  place: TouristPlace | null;
  nearbyPlaces?: TouristPlace[];
  onSelectNearby?: (place: TouristPlace) => void;
  onClose?: () => void;
}

export default function PlaceDetails({
  place,
  nearbyPlaces = [],
  onSelectNearby,
  onClose,
}: PlaceDetailsProps) {
  if (!place) {
    return (
      <section className="place-details empty-details">
        <div>
          <h2>Select a place</h2>
          <p>
            Select a tourist place from the list to
            view its details.
          </p>
        </div>
      </section>
    );
  }

  const nearby = nearbyPlaces
    .filter((item) => item.id !== place.id)
    .slice(0, 5);

  return (
    <section className="place-details">
      {/* ------------------------------------------
          HEADER
      ------------------------------------------- */}

      <div className="place-details-header">
        <div>
          <span className="place-category">
            {place.type}
          </span>

          <h2>{place.name}</h2>
        </div>

        {onClose && (
          <button
            type="button"
            className="close-details-button"
            onClick={onClose}
            aria-label="Close place details"
          >
            ×
          </button>
        )}
      </div>

      {/* ------------------------------------------
          IMAGE
      ------------------------------------------- */}

      {place.image && (
        <div className="place-image-wrapper">
          <img
            src={place.image}
            alt={place.name}
            className="place-image"
            loading="lazy"
          />

          {place.imageSourceUrl && (
            <a
              href={place.imageSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="image-source"
            >
              Image: {place.imageSource || "Source"}
            </a>
          )}
        </div>
      )}

      {/* ------------------------------------------
          DESCRIPTION
      ------------------------------------------- */}

      {place.description && (
        <div className="place-info-block">
          <h3>About this place</h3>

          <p>{place.description}</p>
        </div>
      )}

      {/* ------------------------------------------
          ADDRESS
      ------------------------------------------- */}

      <div className="place-info-block">
        <h3>Location</h3>

        <p>
          📍 {place.address}
        </p>

        {place.latitude !== null &&
          place.longitude !== null && (
            <p className="coordinates">
              {place.latitude.toFixed(6)},{" "}
              {place.longitude.toFixed(6)}
            </p>
          )}
      </div>

      {/* ------------------------------------------
          CONTACT
      ------------------------------------------- */}

      {(place.phone || place.website) && (
        <div className="place-info-block">
          <h3>Contact</h3>

          {place.phone && (
            <p>
              📞{" "}
              <a
                href={`tel:${place.phone}`}
              >
                {place.phone}
              </a>
            </p>
          )}

          {place.website && (
            <p>
              🌐{" "}
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Website
              </a>
            </p>
          )}
        </div>
      )}

      {/* ------------------------------------------
          OPENING HOURS
      ------------------------------------------- */}

      {place.openingHours && (
        <div className="place-info-block">
          <h3>Opening Hours</h3>

          <p>
            🕒 {place.openingHours}
          </p>
        </div>
      )}

      {/* ------------------------------------------
          MAP ACTIONS
      ------------------------------------------- */}

      <div className="place-actions">
        {place.mapsUrl && (
          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="map-button"
          >
            📍 View on Google Maps
          </a>
        )}

        {place.directionsUrl && (
          <a
            href={place.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="directions-button"
          >
            🧭 Get Directions
          </a>
        )}
      </div>

      {/* ------------------------------------------
          SOURCE
      ------------------------------------------- */}

      <div className="place-source">
        <small>
          Data source:{" "}
          {place.source || "OpenStreetMap"}
        </small>
      </div>

      {/* ------------------------------------------
          NEARBY PLACES
      ------------------------------------------- */}

      {nearby.length > 0 && (
        <div className="nearby-places">
          <div className="nearby-header">
            <h3>Nearby Tourist Places</h3>

            <span>
              {nearby.length}
            </span>
          </div>

          <div className="nearby-list">
            {nearby.map((nearbyPlace) => (
              <button
                key={nearbyPlace.id}
                type="button"
                className="nearby-place-card"
                onClick={() =>
                  onSelectNearby?.(
                    nearbyPlace
                  )
                }
              >
                {nearbyPlace.image ? (
                  <img
                    src={nearbyPlace.image}
                    alt={nearbyPlace.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="nearby-image-placeholder">
                    📍
                  </div>
                )}

                <div>
                  <strong>
                    {nearbyPlace.name}
                  </strong>

                  <span>
                    {nearbyPlace.type}
                  </span>

                  <small>
                    {nearbyPlace.address}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}