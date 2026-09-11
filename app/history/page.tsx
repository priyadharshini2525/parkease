
'use client';

import { useCallback, useEffect, useState } from 'react';

interface Location {
  name?: string;
  destination?: string;
  address?: string;
}

interface Slot {
  _id: string;
  slotNumber: number;
  locationId?: Location;
}

interface Reservation {
  _id: string;
  userId: string;
  userName?: string;
  phoneNumber?: string;
  slotId?: Slot | string;
  status: 'active' | 'cancelled';
  reservedAt: string;
}

export default function HistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = 'test-user-1';

  const fetchReservations = useCallback(async () => {
    try {
      const timestamp = Date.now();

      const res = await fetch(
        `/api/reservations?userId=${encodeURIComponent(
          userId
        )}&t=${timestamp}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error('History API error:', data);
        setReservations([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error('Invalid history data:', data);
        setReservations([]);
        return;
      }

      // Show newest reservations first
      const sortedReservations = [...data].sort(
        (a: Reservation, b: Reservation) =>
          new Date(b.reservedAt).getTime() -
          new Date(a.reservedAt).getTime()
      );

      setReservations(sortedReservations);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setReservations([]);
    }
  }, []);

  // First load
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchReservations();
      setLoading(false);
    };

    load();
  }, [fetchReservations]);

  // Refresh when returning to this browser tab
  useEffect(() => {
    const handleFocus = () => {
      fetchReservations();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchReservations();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [fetchReservations]);

  const handleCancel = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this reservation?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to cancel reservation.');
        return;
      }

      alert('Reservation cancelled successfully.');

      // Reload history after cancellation
      await fetchReservations();
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Something went wrong while cancelling.');
    }
  };

  const getSlot = (reservation: Reservation) => {
    if (!reservation.slotId) {
      return null;
    }

    if (typeof reservation.slotId === 'string') {
      return null;
    }

    return reservation.slotId;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-100 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-stone-600">
            Loading reservations...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900">
            My Reservations
          </h1>

          <p className="mt-2 text-stone-600">
            View your parking reservations and their current status.
          </p>
        </div>

        {reservations.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800">
              No reservations yet
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              Your parking reservations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {reservations.map((reservation) => {
              const slot = getSlot(reservation);

              const location =
                slot?.locationId;

              const isActive =
                reservation.status === 'active';

              return (
                <div
                  key={reservation._id}
                  className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
                >

                  {/* Header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <h2 className="text-xl font-bold text-stone-900">
                        {location?.name || 'Parking Area'}
                      </h2>

                      <p className="mt-1 text-sm text-stone-500">
                        {location?.destination ||
                          'Destination not available'}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                        isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isActive
                        ? 'Reserved'
                        : 'Cancelled'}
                    </span>

                  </div>

                  {/* Details */}
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Parking Area
                      </p>

                      <p className="mt-1 font-medium text-stone-800">
                        {location?.name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Destination
                      </p>

                      <p className="mt-1 font-medium text-stone-800">
                        {location?.destination || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Address
                      </p>

                      <p className="mt-1 font-medium text-stone-800">
                        {location?.address || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Slot
                      </p>

                      <p className="mt-1 font-medium text-stone-800">
                        Slot {slot?.slotNumber || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Reserved By
                      </p>

                      <p className="mt-1 font-medium text-stone-800">
                        {reservation.userName || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Phone
                      </p>

                      <p className="mt-1 font-medium text-stone-800">
                        {reservation.phoneNumber || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        Reserved At
                      </p>

                      <p className="mt-1 font-medium text-stone-800">
                        {new Date(
                          reservation.reservedAt
                        ).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>

                  </div>

                  {/* Cancel */}
                  {isActive && (
                    <div className="mt-5 border-t border-stone-200 pt-4">

                      <button
                        onClick={() =>
                          handleCancel(reservation._id)
                        }
                        className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
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
    </main>
  );
}

