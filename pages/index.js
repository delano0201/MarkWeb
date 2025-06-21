import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are chatting with AI." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setLoading(false);
        return;
      }

      setMessages([...updatedMessages, data]);
    } catch (err) {
      alert("Failed to fetch AI response");
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">ChatGPT Clone</h2>
        <button
          className="bg-gray-700 hover:bg-gray-600 rounded-md py-2 px-3 text-sm text-center"
          onClick={() => setMessages([{ role: "system", content: "You are chatting with AI." }])}
        >
          New Chat
        </button>
        <div className="mt-auto text-xs text-gray-500">
          <p>Powered by Shapes API</p>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex flex-col flex-grow bg-white text-gray-900">
        <header className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold">Chat with AI</h1>
        </header>

        <section className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div
                key={i}
                className={`max-w-[60ch] ${
                  m.role === "user" ? "ml-auto bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                } rounded-lg p-4 whitespace-pre-wrap shadow`}
              >
                {m.content}
              </div>
            ))}
          <div ref={bottomRef} />
        </section>

        <footer className="p-4 border-t border-gray-200 bg-gray-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <textarea
              rows={1}
              className="flex-grow resize-none rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`rounded-md bg-blue-600 px-4 py-2 text-white font-semibold transition disabled:opacity-50`}
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
