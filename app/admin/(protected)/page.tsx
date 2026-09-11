import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import Link from "next/link";

export default async function AdminDashboard() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#f3ede3] p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3f2b20]">
            Admin Dashboard
          </h1>

          <p className="text-[#6b5a4a] mt-2">
            Manage ParkEase parking locations, slots and reservations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Link
            href="/admin/locations"
            className="bg-white border border-[#cdbda8] rounded-xl p-6 hover:border-[#285943] hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold text-[#3f2b20]">
              Manage Locations
            </h2>
            <p className="text-[#6b5a4a] mt-2">
              Add, edit and delete parking areas.
            </p>
          </Link>

          <Link
            href="/admin/slots"
            className="bg-white border border-[#cdbda8] rounded-xl p-6 hover:border-[#285943] hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold text-[#3f2b20]">
              Manage Slots
            </h2>
            <p className="text-[#6b5a4a] mt-2">
              View and manage parking slots.
            </p>
          </Link>

          <Link
            href="/admin/reservations"
            className="bg-white border border-[#cdbda8] rounded-xl p-6 hover:border-[#285943] hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold text-[#3f2b20]">
              Reservations
            </h2>
            <p className="text-[#6b5a4a] mt-2">
              View and manage user reservations.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}