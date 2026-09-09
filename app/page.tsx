"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Location {
  _id: string;
  name: string;
  address: string;
  destination: string;
  totalSlots: number;
  latitude: number;
  longitude: number;
}

interface BestSlotResult {
  destination: string;

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

  availableSlots: number;
  totalSlots: number;
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);

  const [loading, setLoading] = useState(true);

  const [finding, setFinding] = useState(false);

  const [destination, setDestination] = useState("");

  const [result, setResult] =
    useState<BestSlotResult | null>(null);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch(
          "/api/locations"
        );

        if (!res.ok) {
          throw new Error(
            "Failed to load locations"
          );
        }

        const data = await res.json();

        setLocations(data);
      } catch (error) {
        console.error(
          "Location loading error:",
          error
        );

        setErrorMsg(
          "Failed to load parking locations."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleFindBest = async () => {
    setFinding(true);

    setResult(null);

    setErrorMsg("");

    if (!destination.trim()) {
      setErrorMsg(
        "Please enter where you want to park."
      );

      setFinding(false);

      return;
    }

    try {
      const res = await fetch(
        "/api/find-best-slot",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            destination:
              destination.trim(),
          }),
        }
      );

      const data = await res.json();

      console.log(
        "Find Best Slot response:",
        data
      );

      if (!res.ok) {
        setErrorMsg(
          data.error ||
            "No suitable parking slot found."
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

      <div className="mb-8 max-w-xl">

        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          ⭐ Find Best Slot
        </h2>

        <p className="text-stone-600 mb-4">
          Tell us where you want to park and
          ParkEase will find the best available
          parking option for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">

          <input
            type="text"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
            placeholder="Where do you want to park? e.g. Phoenix Mall"
            className="flex-1 border border-stone-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-emerald-800"
          />

          <button
            onClick={handleFindBest}
            disabled={finding}
            className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            {finding
              ? "Finding..."
              : "Find Best Slot"}
          </button>

        </div>

      </div>

      {/* Best Slot Result */}

      {result && (
        <div className="mb-8 border-2 border-emerald-800 bg-emerald-50 rounded-lg p-5 max-w-xl">

          <p className="text-sm text-emerald-800 font-semibold uppercase tracking-wide mb-2">
            ⭐ Best Parking Option
          </p>

          <p className="text-sm text-stone-500 mb-1">
            Destination
          </p>

          <p className="text-lg font-semibold text-stone-900 mb-3">
            {result.destination}
          </p>

          <p className="text-sm text-stone-500">
            Recommended Parking Area
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
              🟢{" "}
              <strong>
                {result.availableSlots}
              </strong>{" "}
              slots available
            </p>

            <p>
              📊{" "}
              <strong>
                {result.totalSlots}
              </strong>{" "}
              total slots
            </p>

          </div>

          <Link
            href={`/locations/${result.location.id}`}
            className="inline-block mt-4 bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            View Parking & Reserve
          </Link>

        </div>
      )}

      {/* Error */}

      {errorMsg && (
        <div className="mb-6 border-2 border-amber-800 bg-amber-50 rounded-lg p-4 max-w-xl">

          <p className="text-amber-900 font-medium">
            {errorMsg}
          </p>

        </div>
      )}

      {/* Existing Parking Locations */}

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

            <p className="text-sm text-emerald-700 font-medium mb-1">
              {loc.destination}
            </p>

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