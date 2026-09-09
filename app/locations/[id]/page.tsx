'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Slot {
  _id: string;
  slotNumber: number;
  status: 'available' | 'reserved';
}

export default function LocationPage() {
  const params = useParams();
  const locationId = params.id as string;

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState('test-user-1');

  const fetchSlots = () => {
    fetch(`/api/slots?locationId=${locationId}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSlots();
  }, [locationId]);

  const handleReserve = async (slotId: string) => {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, userId }),
    });
    if (res.ok) {
      fetchSlots();
    } else {
      alert('Slot could not be reserved');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Slots</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className={`border rounded-lg p-4 text-center ${
              slot.status === 'available' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <p className="font-semibold">Slot {slot.slotNumber}</p>
            <p className="text-sm capitalize">{slot.status}</p>
            {slot.status === 'available' && (
              <button
                onClick={() => handleReserve(slot._id)}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Reserve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}