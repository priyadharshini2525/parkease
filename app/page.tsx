
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Location {
  _id: string;
  name: string;
  address: string;
  totalSlots: number;
}

interface BestSlotResult {
  slotNumber: number;
  locationName: string;
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

  const handleFindBest = async () => {
    setFinding(true);
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/find-best-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "test-user-1",
        }),
      });

      const data = await res.json();

      console.log("Find Best Slot response:", data);

      if (!res.ok) {
        setErrorMsg(data.error || "No available parking slot found.");
        return;
      }

      // Make sure the API actually returned a slot
      if (!data.slot) {
        setErrorMsg("The server did not return a parking slot.");
        return;
      }

      // Make sure location information exists
      if (!data.slot.locationId) {
        setErrorMsg("The parking slot has no location information.");
        return;
      }

      setResult({
        slotNumber: data.slot.slotNumber,
        locationName: data.slot.locationId.name,
      });
    } catch (error) {
      console.error("Find Best Slot error:", error);
      setErrorMsg("Something went wrong while finding a parking slot.");
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

      <button
        onClick={handleFindBest}
        disabled={finding}
        className="mb-4 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-400 text-stone-50 px-5 py-2.5 rounded-lg font-semibold transition"
      >
        {finding ? "Finding..." : "Find Best Slot"}
      </button>

      {result && (
        <div className="mb-6 border-2 border-emerald-800 bg-emerald-50 rounded-lg p-4 max-w-md">
          <p className="text-sm text-emerald-800 font-semibold uppercase tracking-wide mb-1">
            Best Slot Found
          </p>

          <p className="text-xl font-bold text-stone-900">
            Slot {result.slotNumber}
          </p>

          <p className="text-stone-700">
            {result.locationName}
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 border-2 border-amber-800 bg-amber-50 rounded-lg p-4 max-w-md">
          <p className="text-amber-900 font-medium">
            {errorMsg}
          </p>
        </div>
      )}

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

