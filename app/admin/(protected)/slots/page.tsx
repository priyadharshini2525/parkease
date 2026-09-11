
'use client';

import { useState, useEffect } from 'react';

interface Location {
  _id: string;
  name: string;
}

interface Slot {
  _id: string;
  slotNumber: number;
  status: string;
}

export default function AdminSlotsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetch('/api/locations');

        if (!res.ok) {
          throw new Error('Failed to load locations');
        }

        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load locations');
      }
    };

    loadLocations();
  }, []);

  const fetchSlots = async (locationId: string) => {
    if (!locationId) {
      setSlots([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `/api/slots?locationId=${encodeURIComponent(locationId)}`,
        {
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to load slots (${res.status})`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid slots response');
      }

      setSlots(data);
    } catch (err) {
      console.error('Fetch slots error:', err);
      setError('Failed to load slots');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedLocationId);
  }, [selectedLocationId]);

  const handleCreateSlots = async () => {
    setError('');
    setSuccess('');

    const numToCreate = Number(count);

    if (!selectedLocationId) {
      setError('Please select a location.');
      return;
    }

    if (!Number.isInteger(numToCreate) || numToCreate < 1) {
      setError('Enter a valid number of slots.');
      return;
    }

    setCreating(true);

    try {
      const startNumber =
        slots.length > 0
          ? Math.max(...slots.map((s) => s.slotNumber)) + 1
          : 1;

      for (let i = 0; i < numToCreate; i++) {
        const res = await fetch('/api/slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId: selectedLocationId,
            slotNumber: startNumber + i,
            status: 'available',
          }),
        });

        const data = await res.json();

        console.log('Create slot response:', res.status, data);

        if (!res.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to create slot (${res.status})`
          );
        }
      }

      setCount('');
      setSuccess(`${numToCreate} slot(s) created successfully.`);

      await fetchSlots(selectedLocationId);
    } catch (err) {
      console.error('Create slots error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create slots'
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Bulk Create Slots
      </h1>

      <div className="flex flex-col gap-3 mb-6 border p-4 rounded-lg">
        <select
          className="border rounded p-2"
          value={selectedLocationId}
          onChange={(e) => {
            setSelectedLocationId(e.target.value);
            setSuccess('');
            setError('');
          }}
        >
          <option value="">Select a location</option>

          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.name}
            </option>
          ))}
        </select>

        <input
          className="border rounded p-2"
          type="number"
          min="1"
          placeholder="Number of slots to add"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />

        <button
          onClick={handleCreateSlots}
          disabled={creating}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Slots'}
        </button>

        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 text-sm">
            {success}
          </p>
        )}
      </div>

      {loading ? (
        <p>Loading slots...</p>
      ) : (
        selectedLocationId && (
          <div>
            <h2 className="font-semibold mb-2">
              Existing slots ({slots.length})
            </h2>

            {slots.length === 0 ? (
              <p className="text-gray-500">
                No slots created for this location yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <span
                    key={slot._id}
                    className={`px-3 py-1 rounded text-sm ${
                      slot.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    #{slot.slotNumber}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}

