import { useState } from "react";

export default function CustomerTable() {
  const [search, setSearch] = useState("");

  const customers = [
    {
      sno: 1,
      customerId: "00001",
      name: "Karthik",
      phone: "6369429716",
      userStatus: "Login User",
    },
  ];

  const filteredCustomers = customers.filter((c) =>
    c.customerId.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="p-6">
      {/* Search box */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-64"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="ml-2 text-gray-500 hover:text-black"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">S.NO</th>
              <th className="px-4 py-2 border">Customer ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Phone Number</th>
              <th className="px-4 py-2 border">Users</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.sno} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{c.sno}</td>
                <td className="px-4 py-2 border">{c.customerId}</td>
                <td className="px-4 py-2 border text-blue-500 hover:underline cursor-pointer">
                  {c.name}
                </td>
                <td className="px-4 py-2 border text-blue-500 hover:underline cursor-pointer">
                  {c.phone}
                </td>
                <td className="px-4 py-2 border text-orange-500 font-medium">
                  {c.userStatus}
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Showing {filteredCustomers.length} of {customers.length} results
        </span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
          <button className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
