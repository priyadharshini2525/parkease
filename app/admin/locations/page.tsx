'use client';

import { useState, useEffect } from 'react';

interface Location {
  _id: string;
  name: string;
  address: string;
  totalSlots: number;
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [totalSlots, setTotalSlots] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(data);
    } catch {
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const resetForm = () => {
    setName('');
    setAddress('');
    setTotalSlots('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const body = { name, address, totalSlots: Number(totalSlots) };

    try {
      const url = editingId ? `/api/locations/${editingId}` : '/api/locations';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Request failed');
      resetForm();
      fetchLocations();
    } catch {
      setError(editingId ? 'Failed to update location' : 'Failed to add location');
    }
  };

  const handleEdit = (loc: Location) => {
    setEditingId(loc._id);
    setName(loc.name);
    setAddress(loc.address);
    setTotalSlots(String(loc.totalSlots));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    try {
      await fetch(`/api/locations/${id}`, { method: 'DELETE' });
      fetchLocations();
    } catch {
      setError('Failed to delete location');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Locations</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-8 border p-4 rounded-lg">
        <input
          className="border rounded p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border rounded p-2"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          className="border rounded p-2"
          type="number"
          placeholder="Total Slots"
          value={totalSlots}
          onChange={(e) => setTotalSlots(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingId ? 'Update Location' : 'Add Location'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">
              Cancel
            </button>
          )}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      {loading ? (
        <p>Loading locations...</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {locations.map((loc) => (
            <li key={loc._id} className="border rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="font-semibold">{loc.name}</p>
                <p className="text-sm text-gray-600">{loc.address} — {loc.totalSlots} slots</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(loc)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => handleDelete(loc._id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}