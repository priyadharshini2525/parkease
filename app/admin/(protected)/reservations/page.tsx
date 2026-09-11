
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
  slotId: Slot;
  status: string;
  createdAt: string;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReservations = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reservations");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load reservations"
        );
      }

      setReservations(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    const confirmCancel = confirm(
      "Are you sure you want to cancel this reservation?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const res = await fetch(
        `/api/reservations/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to cancel reservation"
        );
      }

      fetchReservations();
    } catch (error) {
      console.error(error);
      setError("Failed to cancel reservation");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-2">
        Reservations
      </h1>

      <p className="text-gray-600 mb-6">
        View and manage parking reservations made by
        users.
      </p>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}

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

                {/* USER INFORMATION */}
                <div className="mb-5">
                  <h2 className="text-xl font-semibold">
                    {reservation.userName}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    Phone: {reservation.phoneNumber}
                  </p>
                </div>

                {/* RESERVATION INFORMATION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Parking Area
                    </p>

                    <p className="font-medium mt-1">
                      {location?.name ||
                        "Unknown parking area"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Destination
                    </p>

                    <p className="font-medium mt-1">
                      {location?.destination ||
                        "Unknown destination"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Address
                    </p>

                    <p className="font-medium mt-1">
                      {location?.address ||
                        "Unknown address"}
                    </p>
                  </div>

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

                  <div>
                    <p className="text-xs text-gray-500">
                      Status
                    </p>

                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        reservation.status === "reserved"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Reserved At
                    </p>

                    <p className="font-medium mt-1">
                      {new Date(
                        reservation.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>

                </div>

                {/* CANCEL */}
                {reservation.status === "reserved" && (
                  <div className="mt-5 pt-4 border-t">

                    <button
                      onClick={() =>
                        handleCancel(reservation._id)
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Cancel Reservation
                    </button>

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

