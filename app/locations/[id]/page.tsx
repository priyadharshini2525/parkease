
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Slot {
  _id: string;
  slotNumber: number;
  status: 'available' | 'reserved';
}

export default function LocationPage() {
  const params = useParams();
  const locationId = params?.id as string;

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId] = useState('test-user-1');

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');

      if (!locationId) {
        setError('Location ID is missing.');
        return;
      }

      const res = await fetch(
        `/api/slots?locationId=${encodeURIComponent(locationId)}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch slots (${res.status})`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid slots data received from server.');
      }

      setSlots(data);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Unable to load slots. Please try again.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      fetchSlots();
    }
  }, [locationId]);

  const handleReserve = async (slotId: string) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId,
          userId,
        }),
      });

      if (!res.ok) {
        throw new Error('Reservation failed');
      }

      await fetchSlots();
    } catch (err) {
      console.error('Reservation error:', err);
      alert('Slot could not be reserved.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">
            Loading slots...
          </div>
          <p className="text-gray-500">
            Please wait while we fetch the available parking slots.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-700 mb-2">
              Unable to load slots
            </h1>

            <p className="text-red-600 mb-4">{error}</p>

            <button
              onClick={fetchSlots}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Parking Slots
          </h1>

          <p className="text-gray-500">
            Select an available slot to reserve your parking space.
          </p>
        </div>

        {/* No Slots */}
        {slots.length === 0 ? (
          <div className="border rounded-xl p-10 text-center bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">
              No slots available
            </h2>

            <p className="text-gray-500">
              This location does not have any slots yet.
            </p>
          </div>
        ) : (
          <>
            {/* Slot Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {slots.length} parking slot
                {slots.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Slots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {slots.map((slot) => {
                const isAvailable = slot.status === 'available';

                return (
                  <div
                    key={slot._id}
                    className={`border rounded-xl p-6 shadow-sm transition ${
                      isAvailable
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {/* Slot Number */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">
                        Slot {slot.slotNumber}
                      </h2>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isAvailable ? 'Available' : 'Reserved'}
                      </span>
                    </div>

                    {/* Status */}
                    <p className="text-sm text-gray-600 mb-5">
                      {isAvailable
                        ? 'This slot is available for parking.'
                        : 'This slot has already been reserved.'}
                    </p>

                    {/* Reserve Button */}
                    {isAvailable && (
                      <button
                        onClick={() => handleReserve(slot._id)}
                        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        Reserve Slot
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

