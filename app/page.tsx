"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Location {
  _id: string;
  name: string;
  address: string;
  totalSlots: number;
  latitude: number;
  longitude: number;
}

interface BestSlotResult {
  location: {
    id: string;
    name: string;
    address: string;
  };

  slot: {
    id: string;
    slotNumber: number;
    status: string;
  };

  distance: number;
  availableSlots: number;
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [result, setResult] = useState<BestSlotResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch("/api/locations");

        if (!res.ok) {
          throw new Error("Failed to load locations");
        }

        const data = await res.json();

        setLocations(data);
      } catch (error) {
        console.error("Location loading error:", error);

        setErrorMsg("Failed to load parking locations.");
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleFindBest = () => {
    setFinding(true);
    setResult(null);
    setErrorMsg("");

    if (!navigator.geolocation) {
      setErrorMsg(
        "Geolocation is not supported by your browser."
      );
      setFinding(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log("User location:", {
            latitude,
            longitude,
          });

          const res = await fetch("/api/find-best-slot", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              latitude,
              longitude,
            }),
          });

          const data = await res.json();

          console.log("Find Best Slot response:", data);

          if (!res.ok) {
            setErrorMsg(
              data.error ||
                "No available parking slot found."
            );
            return;
          }

          setResult(data);
        } catch (error) {
          console.error(
            "Find Best Slot error:",
            error
          );

          setErrorMsg(
            "Something went wrong while finding a parking slot."
          );
        } finally {
          setFinding(false);
        }
      },

      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        if (error.code === 1) {
          setErrorMsg(
            "Location permission was denied. Please allow location access to find the nearest parking slot."
          );
        } else if (error.code === 2) {
          setErrorMsg(
            "Your location could not be determined."
          );
        } else {
          setErrorMsg(
            "Unable to get your current location."
          );
        }

        setFinding(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (loading) {
    return (
      <div className="p-8 bg-stone-50 min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#f3ede3] min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-stone-900">
        ParkEase
      </h1>

      {/* Find Best Slot */}
      <button
        onClick={handleFindBest}
        disabled={finding}
        className="mb-4 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-stone-50 px-5 py-2.5 rounded-lg font-semibold transition"
      >
        {finding
          ? "Finding Nearby Parking..."
          : "Find Best Slot Near Me"}
      </button>

      {/* Best Slot Result */}
      {result && (
        <div className="mb-6 border-2 border-emerald-800 bg-emerald-50 rounded-lg p-5 max-w-md">

          <p className="text-sm text-emerald-800 font-semibold uppercase tracking-wide mb-2">
            ⭐ Best Parking Option
          </p>

          <p className="text-xl font-bold text-stone-900">
            {result.location.name}
          </p>

          <p className="text-stone-600 mb-3">
            {result.location.address}
          </p>

          <div className="space-y-1 text-stone-700">

            <p>
              🅿️{" "}
              <strong>
                Slot {result.slot.slotNumber}
              </strong>
            </p>

            <p>
              📏{" "}
              <strong>
                {result.distance < 1
                  ? `${Math.round(
                      result.distance * 1000
                    )} m`
                  : `${result.distance} km`}
              </strong>{" "}
              away
            </p>

            <p>
              🟢{" "}
              <strong>
                {result.availableSlots}
              </strong>{" "}
              slots available
            </p>

          </div>

          <Link
            href={`/locations/${result.location.id}`}
            className="inline-block mt-4 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            View Parking
          </Link>

        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="mb-6 border-2 border-amber-800 bg-amber-50 rounded-lg p-4 max-w-md">

          <p className="text-amber-900 font-medium">
            {errorMsg}
          </p>

        </div>
      )}

      {/* Parking Locations */}
      <h2 className="text-2xl font-bold text-stone-900 mb-4">
        Parking Locations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {locations.map((loc) => (
          <Link
            key={loc._id}
            href={`/locations/${loc._id}`}
            className="border border-stone-300 bg-white rounded-lg p-4 hover:shadow-md hover:border-emerald-800 transition"
          >

            <h2 className="text-xl font-semibold text-stone-900">
              {loc.name}
            </h2>

            <p className="text-stone-600">
              {loc.address}
            </p>

            <p className="text-sm mt-2 text-stone-500">
              {loc.totalSlots} total slots
            </p>

          </Link>
        ))}

      </div>

    </div>
  );
}