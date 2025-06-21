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
    <div className="flex h-screen bg-[#0d0d0d] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1a1a] flex flex-col p-4 space-y-4 border-r border-[#2c2c2c]">
        <h2 className="text-xl font-bold mb-6 text-white">ChatGPT Clone</h2>
        <button
          className="bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-md py-2 px-3 text-sm text-white transition"
          onClick={() =>
            setMessages([{ role: "system", content: "You are chatting with Mark." }])
          }
        >
          + New Chat
        </button>
        <div className="mt-auto text-xs text-gray-500">
          <p>Powered by Shapes API</p>
        </div>
      </aside>

      {/* Chat area */}
      <main className="flex flex-col flex-grow bg-[#0d0d0d]">
        <header className="p-4 border-b border-[#2c2c2c]">
          <h1 className="text-2xl font-semibold text-white">Chat with AI</h1>
        </header>

        <section className="flex-grow overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
          {messages
            .filter((m) => m.role !== "system")
            .map((m, i) => (
              <div
                key={i}
                className={`max-w-[60ch] ${
                  m.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-[#1a1a1a] text-gray-300"
                } rounded-lg p-4 whitespace-pre-wrap shadow-md shadow-black/30`}
              >
                {m.content}
              </div>
            ))}
          <div ref={bottomRef} />
        </section>

        <footer className="p-4 border-t border-[#2c2c2c] bg-[#1a1a1a]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <textarea
              rows={1}
              className="flex-grow resize-none rounded-md border border-[#333] bg-[#121212] p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold transition disabled:opacity-50 hover:bg-blue-700"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}
