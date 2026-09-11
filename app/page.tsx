
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

interface Slot {
  _id: string;
  slotNumber: number;
  status: "available" | "reserved";
}

interface LocationWithAvailability extends Location {
  availableSlots: number;
  reservedSlots: number;
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
  const [locations, setLocations] = useState<
    LocationWithAvailability[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [finding, setFinding] = useState(false);

  const [destination, setDestination] = useState("");

  const [result, setResult] =
    useState<BestSlotResult | null>(null);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const locationRes = await fetch(
          "/api/locations",
          {
            cache: "no-store",
          }
        );

        if (!locationRes.ok) {
          throw new Error(
            "Failed to load locations"
          );
        }

        const locationData: Location[] =
          await locationRes.json();

        const locationsWithAvailability =
          await Promise.all(
            locationData.map(async (location) => {
              try {
                const slotRes = await fetch(
                  `/api/slots?locationId=${location._id}`,
                  {
                    cache: "no-store",
                  }
                );

                if (!slotRes.ok) {
                  return {
                    ...location,
                    availableSlots: 0,
                    reservedSlots: 0,
                  };
                }

                const slots: Slot[] =
                  await slotRes.json();

                const availableSlots =
                  slots.filter(
                    (slot) =>
                      slot.status === "available"
                  ).length;

                const reservedSlots =
                  slots.filter(
                    (slot) =>
                      slot.status === "reserved"
                  ).length;

                return {
                  ...location,
                  availableSlots,
                  reservedSlots,
                };
              } catch (error) {
                console.error(
                  `Failed to load slots for ${location.name}:`,
                  error
                );

                return {
                  ...location,
                  availableSlots: 0,
                  reservedSlots: 0,
                };
              }
            })
          );

        setLocations(
          locationsWithAvailability
        );
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
      <div className="min-h-screen bg-stone-50 p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3ede3] p-8">

      <h1 className="mb-6 text-3xl font-bold text-stone-900">
        ParkEase
      </h1>

      {/* Find Best Slot */}

      <div className="mb-8 max-w-xl">

        <h2 className="mb-2 text-2xl font-bold text-stone-900">
          Find Best Slot
        </h2>

        <p className="mb-4 text-stone-600">
          Tell us where you want to park and
          ParkEase will find the best available
          parking option for you.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">

          <input
            type="text"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
            placeholder="Where do you want to park? e.g. Phoenix Mall"
            className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-800"
          />

          <button
            onClick={handleFindBest}
            disabled={finding}
            className="rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-900 disabled:bg-stone-400"
          >
            {finding
              ? "Finding..."
              : "Find Best Slot"}
          </button>

        </div>

      </div>

      {/* Best Slot Result */}

      {result && (
        <div className="mb-8 max-w-xl rounded-lg border-2 border-emerald-800 bg-emerald-50 p-5">

          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Best Parking Option
          </p>

          <p className="mb-1 text-sm text-stone-500">
            Destination
          </p>

          <p className="mb-3 text-lg font-semibold text-stone-900">
            {result.destination}
          </p>

          <p className="text-sm text-stone-500">
            Recommended Parking Area
          </p>

          <p className="text-xl font-bold text-stone-900">
            {result.location.name}
          </p>

          <p className="mb-3 text-stone-600">
            {result.location.address}
          </p>

          <div className="space-y-1 text-stone-700">

            <p>
              {" "}
              <strong>
                Slot {result.slot.slotNumber}
              </strong>
            </p>

            <p>
              {" "}
              <strong>
                {result.availableSlots}
              </strong>{" "}
              slots available
            </p>

            <p>
              {" "}
              <strong>
                {result.totalSlots}
              </strong>{" "}
              total slots
            </p>

          </div>

          <Link
            href={`/locations/${result.location.id}`}
            className="mt-4 inline-block rounded-lg bg-emerald-800 px-4 py-2 font-semibold text-white transition hover:bg-emerald-900"
          >
            View Parking & Reserve
          </Link>

        </div>
      )}

      {/* Error */}

      {errorMsg && (
        <div className="mb-6 max-w-xl rounded-lg border-2 border-amber-800 bg-amber-50 p-4">

          <p className="font-medium text-amber-900">
            {errorMsg}
          </p>

        </div>
      )}

      {/* Existing Parking Locations */}

      <h2 className="mb-4 text-2xl font-bold text-stone-900">
        Parking Locations
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

        {locations.map((loc) => (

          <Link
            key={loc._id}
            href={`/locations/${loc._id}`}
            className="rounded-lg border border-stone-300 bg-white p-4 transition hover:border-emerald-800 hover:shadow-md"
          >

            <p className="mb-1 text-sm font-medium text-emerald-700">
              {loc.destination}
            </p>

            <h2 className="text-xl font-semibold text-stone-900">
              {loc.name}
            </h2>

            <p className="text-stone-600">
              {loc.address}
            </p>

            {/* Slot Availability */}

            <div className="mt-4 grid grid-cols-2 gap-2">

              <div className="rounded-lg bg-green-100 p-3">
                <p className="text-xs font-medium text-green-800">
                  Available
                </p>

                <p className="mt-1 text-xl font-bold text-green-900">
                  {loc.availableSlots}
                </p>
              </div>

              <div className="rounded-lg bg-red-100 p-3">
                <p className="text-xs font-medium text-red-800">
                  Reserved
                </p>

                <p className="mt-1 text-xl font-bold text-red-900">
                  {loc.reservedSlots}
                </p>
              </div>

            </div>

            <p className="mt-3 text-sm font-medium text-stone-500">
              {loc.availableSlots + loc.reservedSlots} total slots
            </p>

          </Link>

        ))}

      </div>

    </div>
  );
}

