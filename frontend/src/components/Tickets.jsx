import { useEffect, useState } from "react";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const response = await fetch("[http://127.0.0.1:8000/tickets](http://127.0.0.1:8000/tickets)");
      const data = await response.json();

      // The backend already sorts by id desc, but keeping this guarantees client-side safety
      const sorted = [...data].sort((a, b) => b.id - a.id);
      setTickets(sorted);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      // Updated to match the backend's expected JSON Pydantic body
      await fetch(`http://127.0.0.1:8000/tickets/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: status }),
      });

      // Refresh data locally after updating status
      loadTickets();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    loadTickets();

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter computations
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.question.toLowerCase().includes(search.toLowerCase()) ||
      ticket.status.toLowerCase().includes(search.toLowerCase())
  );

  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const inProgressTickets = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const closedTickets = tickets.filter((ticket) => ticket.status === "CLOSED").length;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Support Tickets</h2>
        <button
          onClick={loadTickets}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-4 mb-4 text-sm flex-wrap">
        <div>
          Total: <strong className="ml-1">{tickets.length}</strong>
        </div>
        <div>
          Open: <strong className="ml-1 text-green-600">{openTickets}</strong>
        </div>
        <div>
          In Progress: <strong className="ml-1 text-yellow-600">{inProgressTickets}</strong>
        </div>
        <div>
          Closed: <strong className="ml-1 text-gray-600">{closedTickets}</strong>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search tickets by query or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <p className="text-gray-500">Loading tickets...</p>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border rounded-lg bg-gray-50">
          No tickets found
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="border-r p-3 text-left w-20">ID</th>
                <th className="border-r p-3 text-left">Question</th>
                <th className="border-r p-3 text-left w-36">Status</th>
                <th className="p-3 text-left w-44">Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 border-b last:border-0">
                  <td className="border-r p-3 font-mono">#{ticket.id}</td>
                  <td className="border-r p-3 whitespace-pre-wrap">{ticket.question}</td>
                  <td className="border-r p-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${
                        ticket.status === "OPEN"
                          ? "bg-green-600"
                          : ticket.status === "IN_PROGRESS"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      value={ticket.status}
                      onChange={(e) => updateStatus(ticket.id, e.target.value)}
                      className="border rounded p-1.5 text-sm bg-white w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Tickets;