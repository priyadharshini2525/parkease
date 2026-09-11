
"use client";

import { useEffect, useState } from "react";

interface Location {
  _id: string;
  name: string;
  address: string;
  destination: string;
}

interface Slot {
  _id: string;
  slotNumber: number;
  locationId: Location;
}

interface Reservation {
  _id: string;
  userId: string;
  userName: string;
  phoneNumber: string;
  slotId: Slot | null;
  status: string;
  reservedAt: string;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReservations = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const res = await fetch(
        `/api/reservations?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load reservations"
        );
      }

      // Make sure newest reservation appears first
      const sortedReservations = [...data].sort(
        (a: Reservation, b: Reservation) =>
          new Date(b.reservedAt).getTime() -
          new Date(a.reservedAt).getTime()
      );

      setReservations(sortedReservations);
    } catch (error) {
      console.error(error);
      setError("Failed to load reservations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold">
            Reservations
          </h1>

          <p className="text-gray-600 mt-1">
            View parking reservations made by users.
          </p>
        </div>

        <button
          onClick={() => fetchReservations(true)}
          disabled={refreshing}
          className="bg-green-800 hover:bg-green-900 disabled:opacity-60 text-white px-4 py-2 rounded-lg"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh Reservations"}
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <p>Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <div className="border rounded-lg p-6 bg-white">
          <p className="text-gray-600">
            No reservations found.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {reservations.map((reservation) => {
            const location =
              reservation.slotId?.locationId;

            return (
              <div
                key={reservation._id}
                className="border rounded-lg p-5 bg-white shadow-sm"
              >

                {/* User Information */}
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">
                    {reservation.userName || "Unknown user"}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    Phone:{" "}
                    {reservation.phoneNumber ||
                      "Not provided"}
                  </p>
                </div>

                {/* Reservation Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Parking Area */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Parking Area
                    </p>

                    <p className="font-medium mt-1">
                      {location?.name ||
                        "Unknown parking area"}
                    </p>
                  </div>

                  {/* Destination */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Destination
                    </p>

                    <p className="font-medium mt-1">
                      {location?.destination ||
                        "Unknown destination"}
                    </p>
                  </div>

                  {/* Address */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Address
                    </p>

                    <p className="font-medium mt-1">
                      {location?.address ||
                        "Unknown address"}
                    </p>
                  </div>

                  {/* Slot */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Slot
                    </p>

                    <p className="font-medium mt-1">
                      {reservation.slotId?.slotNumber
                        ? `Slot ${reservation.slotId.slotNumber}`
                        : "Unknown slot"}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Status
                    </p>

                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        reservation.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {reservation.status === "active"
                        ? "Reserved"
                        : "Cancelled"}
                    </span>
                  </div>

                  {/* Reserved At */}
                  <div>
                    <p className="text-xs text-gray-500">
                      Reserved At
                    </p>

                    <p className="font-medium mt-1">
                      {reservation.reservedAt
                        ? new Date(
                            reservation.reservedAt
                          ).toLocaleString()
                        : "Unknown time"}
                    </p>
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

