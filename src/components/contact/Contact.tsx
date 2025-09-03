import { useEffect, useState } from "react";
import toast from "react-hot-toast";
interface Contact {
  name: string;
  email: string;
  phoneNumber: string;
  subject?: string;
  comments: string;
}

export default function ContactTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/contacts", {
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch contacts");
        return res.json();
      })
      .then((data) => {
        const contactArray = Array.isArray(data) ? data : [];
        setContacts(contactArray);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load contacts");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Contact Submissions</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone Number</th>
            <th className="p-2 border">Subject</th>
            <th className="p-2 border">Comments</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length > 0 ? (
            contacts.map((c, index) => (
              <tr key={index}>
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">{c.phoneNumber}</td>
                <td className="p-2 border">{c.subject || "N/A"}</td>
                <td className="p-2 border">{c.comments}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-2 text-center">
                No contact submissions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
