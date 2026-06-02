import { useState, useEffect } from "react";
import UploadPdf from "./components/UploadPdf";
import Tickets from "./components/Tickets";
import ChatHistory from "./components/ChatHistory";
import Analytics from "./components/Analytics";

function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    total_tickets: 0,
    open_tickets: 0,
    in_progress_tickets: 0,
    closed_tickets: 0,
  });

  const loadStats = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/stats"
      );

      const data = await response.json();

      setStats(data);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadStats();

    const interval = setInterval(
      loadStats,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  const askQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
          }),
        }
      );

      const data = await res.json();

      setResponse(data);

      loadStats();

    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-8">
          AI Customer Support Assistant
        </h1>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">
              Total Tickets
            </h3>
            <p className="text-4xl font-bold mt-2">
              {stats.total_tickets}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">
              Open Tickets
            </h3>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {stats.open_tickets}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">
              In Progress
            </h3>
            <p className="text-4xl font-bold text-yellow-500 mt-2">
              {stats.in_progress_tickets}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <h3 className="text-gray-500 text-sm">
              Closed Tickets
            </h3>
            <p className="text-4xl font-bold text-gray-600 mt-2">
              {stats.closed_tickets}
            </p>
          </div>

        </div>

        {/* Chat Assistant */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">

          <h2 className="text-2xl font-semibold mb-4">
            Chat Assistant
          </h2>

          <div className="flex gap-3">

            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  askQuestion();
                }
              }}
              className="flex-1 border rounded-lg p-3"
            />

            <button
              onClick={askQuestion}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              {loading ? "Loading..." : "Ask"}
            </button>

          </div>

          {response && (
            <div className="mt-6">

              <h3 className="font-semibold mb-2">
                Answer
              </h3>

              <div className="border rounded-lg p-4 bg-slate-50">
                {response.answer}
              </div>

              {response.ticket && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold">
                    Ticket Created
                  </h4>

                  <pre className="text-sm mt-2">
                    {JSON.stringify(
                      response.ticket,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Upload + Tickets + Chat History */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">

          <div className="bg-white rounded-xl shadow p-6">
            <UploadPdf />
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <Tickets />
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <ChatHistory />
          </div>

        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-xl shadow p-6">
          <Analytics stats={stats} />
        </div>

      </div>
    </div>
  );
}

export default App;