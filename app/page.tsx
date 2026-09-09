'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Location {
  _id: string;
  name: string;
  address: string;
  totalSlots: number;
}

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  const handleFindBest = async () => {
    setFinding(true);
    const res = await fetch('/api/find-best-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'test-user-1' }),
    });
    const data = await res.json();
    setFinding(false);
    if (res.ok) {
      alert(`Reserved Slot ${data.slot.slotNumber} at ${data.slot.locationId.name}`);
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">ParkEase</h1>
      <button
        onClick={handleFindBest}
        disabled={finding}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded font-semibold"
      >
        {finding ? 'Finding...' : 'Find Best Slot'}
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <Link
            key={loc._id}
            href={`/locations/${loc._id}`}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{loc.name}</h2>
            <p className="text-gray-600">{loc.address}</p>
            <p className="text-sm mt-2">{loc.totalSlots} total slots</p>
          </Link>
        ))}
      </div>
    </div>
  );
}