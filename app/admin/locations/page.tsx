"use client";

import { useState, useEffect } from "react";

interface Location {
  _id: string;
  name: string;
  address: string;
  destination: string;
  totalSlots: number;
  latitude: number;
  longitude: number;
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [destination, setDestination] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocations = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/locations");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to load locations"
        );
      }

      setLocations(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const resetForm = () => {
    setName("");
    setAddress("");
    setDestination("");
    setTotalSlots("");
    setLatitude("");
    setLongitude("");
    setEditingId(null);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    const body = {
      name,
      address,
      destination,
      totalSlots: Number(totalSlots),
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    try {
      const url = editingId
        ? `/api/locations/${editingId}`
        : "/api/locations";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Request failed"
        );
      }

      resetForm();
      fetchLocations();
    } catch (error) {
      console.error(error);

      setError(
        editingId
          ? "Failed to update parking location"
          : "Failed to add parking location"
      );
    }
  };

  const handleEdit = (loc: Location) => {
    setEditingId(loc._id);

    setName(loc.name);
    setAddress(loc.address);
    setDestination(loc.destination);
    setTotalSlots(String(loc.totalSlots));
    setLatitude(String(loc.latitude));
    setLongitude(String(loc.longitude));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this parking location?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/locations/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      fetchLocations();
    } catch (error) {
      console.error(error);

      setError("Failed to delete parking location");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">
        Manage Parking Locations
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 mb-8 border p-4 rounded-lg bg-white"
      >

        <input
          className="border rounded p-2"
          placeholder="Parking Area Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          required
        />

        <input
          className="border rounded p-2"
          placeholder="Destination / Place Name"
          value={destination}
          onChange={(e) =>
            setDestination(e.target.value)
          }
          required
        />

        <p className="text-xs text-gray-500">
          Example: Phoenix Mall, VIT Chennai,
          PVR Theatre, Chennai Airport
        </p>

        <input
          className="border rounded p-2"
          placeholder="Parking Area Address"
          value={address}
          onChange={(e) =>
            setAddress(e.target.value)
          }
          required
        />

        <input
          className="border rounded p-2"
          type="number"
          min="1"
          placeholder="Total Slots"
          value={totalSlots}
          onChange={(e) =>
            setTotalSlots(e.target.value)
          }
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <input
            className="border rounded p-2"
            type="number"
            step="any"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) =>
              setLatitude(e.target.value)
            }
            required
          />

          <input
            className="border rounded p-2"
            type="number"
            step="any"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) =>
              setLongitude(e.target.value)
            }
            required
          />

        </div>

        <p className="text-xs text-gray-500">
          Coordinates identify the parking area's
          physical location.
        </p>

        <div className="flex gap-2">

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {editingId
              ? "Update Parking Area"
              : "Add Parking Area"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}

        </div>

        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}

      </form>

      {loading ? (
        <p>Loading parking locations...</p>
      ) : (

        <ul className="flex flex-col gap-3">

          {locations.map((loc) => (

            <li
              key={loc._id}
              className="border rounded-lg p-4 bg-white"
            >

              <div>

                <p className="font-semibold text-lg">
                  {loc.name}
                </p>

                <p className="text-sm text-emerald-700 font-medium">
                  Destination: {loc.destination}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {loc.address}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {loc.totalSlots} slots
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Coordinates:{" "}
                  {loc.latitude},{" "}
                  {loc.longitude}
                </p>

              </div>

              <div className="flex gap-3 mt-3">

                <button
                  onClick={() =>
                    handleEdit(loc)
                  }
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(loc._id)
                  }
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>

              </div>

            </li>

          ))}

        </ul>

      )}

    </div>
  );
}