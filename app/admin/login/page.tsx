"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid admin phone number.");
        return;
      }

      // Login successful
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 bg-[#f3ede3]">
      <div className="w-full max-w-md">

        <div className="bg-white border border-[#cdbda8] rounded-xl shadow-sm p-6">

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#3f2b20]">
              Admin Login
            </h1>

            <p className="text-[#6b5a4a] mt-2">
              Enter your authorized phone number to continue.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
          >

            <div>
              <label className="block text-sm font-medium text-[#4b3a2d] mb-1">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter admin phone number"
                className="w-full border border-[#cdbda8] rounded-lg px-4 py-3 bg-[#faf8f4] outline-none focus:border-[#285943]"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#285943] hover:bg-[#1f4634] disabled:bg-[#9ca3af] text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Checking..." : "Login as Admin"}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}