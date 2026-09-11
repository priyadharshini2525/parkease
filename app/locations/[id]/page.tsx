'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Slot {
  _id: string;
  slotNumber: number;
  status: 'available' | 'reserved';
}

interface Reservation {
  _id: string;
  slotId: string | Slot;
  userId: string;
  userName: string;
  phoneNumber: string;
  status: string;
  reservedAt: string;
}

export default function LocationPage() {
  const params = useParams();
  const locationId = params?.id as string;

  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userId] = useState('test-user-1');

  // Reservation form
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reserving, setReserving] = useState(false);

  // Fetch slots
  const fetchSlots = async () => {
    try {
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
        throw new Error('Invalid slots data received.');
      }

      setSlots(data);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Unable to load slots. Please try again.');
      setSlots([]);
    }
  };

  // Fetch current user's reservations
  const fetchReservations = async () => {
    try {
      const res = await fetch(
        `/api/reservations?userId=${encodeURIComponent(userId)}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid reservation data received.');
      }

      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setReservations([]);
    }
  };

  // Load slots and reservations
  const loadPage = async () => {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        fetchSlots(),
        fetchReservations(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      loadPage();
    }
  }, [locationId]);

  // Find reservation belonging to a particular slot
  const getReservationForSlot = (slotId: string) => {
    return reservations.find((reservation) => {
      if (reservation.status !== 'active') {
        return false;
      }

      if (typeof reservation.slotId === 'string') {
        return reservation.slotId === slotId;
      }

      return reservation.slotId?._id === slotId;
    });
  };

  // Open reservation form
  const handleReserveClick = (slotId: string) => {
    setSelectedSlot(slotId);
    setUserName('');
    setPhoneNumber('');
  };

  // Confirm reservation
  const handleConfirmReservation = async () => {
    if (!selectedSlot) {
      return;
    }

    if (!userName.trim()) {
      alert('Please enter your name.');
      return;
    }

    if (!phoneNumber.trim()) {
      alert('Please enter your phone number.');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber.trim())) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      setReserving(true);

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotId: selectedSlot,
          userId,
          userName: userName.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Reservation failed');
      }

      alert('Slot reserved successfully!');

      // Close form
      setSelectedSlot(null);

      // Refresh both slots and reservations
      await Promise.all([
        fetchSlots(),
        fetchReservations(),
      ]);

    } catch (err) {
      console.error('Reservation error:', err);

      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Slot could not be reserved.');
      }
    } finally {
      setReserving(false);
    }
  };

  // Cancel reservation form
  const handleCancelForm = () => {
    if (reserving) {
      return;
    }

    setSelectedSlot(null);
    setUserName('');
    setPhoneNumber('');
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

            <p className="text-red-600 mb-4">
              {error}
            </p>

            <button
              onClick={loadPage}
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

                // Check whether this reserved slot belongs to current user
                const myReservation = getReservationForSlot(slot._id);

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

                    {/* Show MY reservation details */}
                    {!isAvailable && myReservation && (
                      <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">

                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Your Reservation
                        </p>

                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">
                              Name:
                            </span>{' '}
                            {myReservation.userName}
                          </p>

                          <p>
                            <span className="font-medium">
                              Phone:
                            </span>{' '}
                            {myReservation.phoneNumber}
                          </p>

                          <p>
                            <span className="font-medium">
                              Reserved:
                            </span>{' '}
                            {new Date(
                              myReservation.reservedAt
                            ).toLocaleString()}
                          </p>
                        </div>

                      </div>
                    )}

                    {/* Reserve Button */}
                    {isAvailable && (
                      <button
                        onClick={() =>
                          handleReserveClick(slot._id)
                        }
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

      {/* Reservation Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                Reserve Parking Slot
              </h2>

              <p className="text-gray-500">
                Please enter your details to confirm the reservation.
              </p>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Name
              </label>

              <input
                type="text"
                value={userName}
                onChange={(e) =>
                  setUserName(e.target.value)
                }
                placeholder="Enter your name"
                disabled={reserving}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(
                    /\D/g,
                    ''
                  );

                  setPhoneNumber(value.slice(0, 10));
                }}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                disabled={reserving}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelForm}
                disabled={reserving}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReservation}
                disabled={reserving}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {reserving
                  ? 'Reserving...'
                  : 'Confirm Reservation'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}