import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are chatting with mark." },
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
    <div className="flex h-screen bg-[#1e1e1e] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2a2a2a] flex flex-col p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6 text-white">ChatGPT Clone</h2>
        <button
          className="bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-md py-2 px-3 text-sm text-white"
          onClick={() => setMessages([{ role: "system", content: "You are chatting with Mark." }])}
        >
          + New Chat
        </button>
        <div className="mt-auto text-xs text-gray-400">
          <p>Powered by Shapes API</p>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex flex-col flex-grow bg-[#1e1e1e] text-white">
        <header className="p-4 border-b border-[#333]">
          <h1 className="text-2xl font-semibold">Chat with AI</h1>
        </header>

        <section className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div
                key={i}
                className={`max-w-[60ch] ${
                  m.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-[#2d2d2d] text-gray-200"
                } rounded-lg p-4 whitespace-pre-wrap shadow`}
              >
                {m.content}
              </div>
            ))}
          <div ref={bottomRef} />
        </section>

        <footer className="p-4 border-t border-[#333] bg-[#2a2a2a]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <textarea
              rows={1}
              className="flex-grow resize-none rounded-md border border-[#444] bg-[#1e1e1e] p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
