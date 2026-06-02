import { useEffect, useState } from "react";

function ChatHistory() {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");

  const loadChats = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat-history"
      );

      const data = await response.json();

      setChats(data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const filteredChats = chats.filter(
    (chat) =>
      chat.question
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Chat History
      </h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search chats..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full border rounded-lg p-2"
        />
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Total Chats:{" "}
        <strong>{chats.length}</strong>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">

        <table className="w-full border-collapse">

          <thead>
            <tr className="bg-slate-100 sticky top-0">
              <th className="border p-3">
                ID
              </th>

              <th className="border p-3">
                Question
              </th>

              <th className="border p-3">
                Confidence
              </th>
            </tr>
          </thead>

          <tbody>

            {filteredChats.map((chat) => (
              <tr
                key={chat.id}
                className="hover:bg-slate-50"
              >
                <td className="border p-3">
                  #{chat.id}
                </td>

                <td className="border p-3">
                  {chat.question}
                </td>

                <td className="border p-3">

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      chat.confidence === "HIGH"
                        ? "bg-green-600"
                        : chat.confidence === "MEDIUM"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {chat.confidence}
                  </span>

                </td>
              </tr>
            ))}

            {filteredChats.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="border p-4 text-center text-gray-500"
                >
                  No chats found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}

export default ChatHistory;