'use client';

import { useState, useEffect } from 'react';

interface Reservation {
  _id: string;
  slotId: {
    _id: string;
    slotNumber: number;
    locationId: { name: string };
  };
  status: 'active' | 'cancelled';
  reservedAt: string;
}

export default function HistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = 'test-user-1';

  const fetchReservations = () => {
    fetch(`/api/reservations?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setReservations(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/reservations/${id}`, { method: 'PUT' });
    if (res.ok) {
      fetchReservations();
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Reservations</h1>
      <div className="space-y-3">
        {reservations.map((r) => (
          <div key={r._id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">Slot {r.slotId?.slotNumber}</p>
              <p className="text-sm text-gray-600">{new Date(r.reservedAt).toLocaleString()}</p>
              <p className={`text-sm capitalize ${r.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                {r.status}
              </p>
            </div>
            {r.status === 'active' && (
              <button
                onClick={() => handleCancel(r._id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}