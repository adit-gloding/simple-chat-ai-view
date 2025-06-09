"use client";
// Import necessary hooks and libraries
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// API base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// General Steps
// 1. Fetch conversation detail, to get thread id
// 2. if thread id is not found, create new thread
// 3. send message to agent
// 4. fetch message from agent
// 5. display message

export default function AgentChatPage() {
  // Get agent id from URL params
  const params = useParams();
  const router = useRouter();
  const agentId = Number(params.id); // Current agent's ID

  // Store agent details fetched from API
  const [agent, setAgent] = useState(null);
  // Store the chat message history for the current thread
  const [history, setHistory] = useState([]);
  // Store the current thread id for the conversation
  const [thread, setThread] = useState(null);
  // Store the current input value from the user
  const [input, setInput] = useState("");
  // Store a temporary user message for optimistic UI
  const [pendingUserMsg, setPendingUserMsg] = useState(null);

  // On component mount, fetch the conversation (thread and agent info)
  useEffect(() => {
    fetchConversation();
  }, []);

  // Fetch the conversation thread and agent details for the current agent
  const fetchConversation = async () => {
    try {
      const response = await axios.get(`${API_URL}/v1/conversations/agent/${agentId}`);
      // Set thread id and agent details from API response
      setThread(response.data.data.thread_id);
      setAgent(response.data.data.agent);
      // Fetch the message history for this thread
      await fetchMessageHistory(response.data.data.thread_id);
    } catch (error) {
      console.error("Error fetching thread:", error);
    }
  };

  // Fetch the message history for a given thread id
  const fetchMessageHistory = async (threadIdParam) => {
    try {
      const response = await axios.get(`${API_URL}/v1/conversations/thread/${threadIdParam}/history`);
      const data = response.data.data;
      setHistory(data); // Set the chat history
      setPendingUserMsg(null); // Clear any optimistic user message
    } catch (error) {
      console.error("Error fetching message history:", error);
      setPendingUserMsg(null);
    }
  };

  // Handle sending a new user message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Create an optimistic user message for immediate UI feedback
    const optimisticMsg = {
      role: "user",
      content: [{ text: { value: input } }],
    };
    setPendingUserMsg(optimisticMsg);
    setInput(""); // Clear the input field

    try {
      // Prepare the request body for sending a message
      const body = {
        agent_id: agentId,
        thread_id: thread,
        message: input,
      };
      // Send the message to the backend
      await axios.post(`${API_URL}/v1/conversations`, body);
      // Fetch the latest message history after sending
      await fetchMessageHistory(thread);
    } catch (error) {
      console.error("Error sending message:", error);
      setPendingUserMsg(null);
    }
  };

  // Render the chat UI
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      {/* Back button to return to agent list */}
      <button onClick={() => router.push("/")} style={{ marginBottom: 16, background: "none", border: "none", color: "#0070f3", cursor: "pointer" }}>&larr; Back to Agents</button>
      {/* Agent name and instructions */}
      <h2 style={{ marginBottom: 15 }}>{agent?.name}</h2>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>{agent?.instructions}</div>
      {/* Chat message history */}
      <div style={{ minHeight: 200, border: "1px solid #ddd", borderRadius: 6, padding: 12, marginBottom: 16, background: "#fafbfc" }}>
        {/* Render all messages in history */}
        {history && history.map((msg, i) => {
          // Extract the message text from the OpenAI-style message structure
          const text = Array.isArray(msg.content) && msg.content[0]?.text?.value
            ? msg.content[0].text.value
            : '';
          const isUser = msg.role === "user";
          return (
            <div key={i} style={{ textAlign: isUser ? "right" : "left", margin: "8px 0" }}>
              <span style={{
                display: "inline-block",
                background: isUser ? "#0070f3" : "#eee",
                color: isUser ? "#fff" : "#222",
                borderRadius: 16,
                padding: "6px 14px",
                maxWidth: "80%",
                wordBreak: "break-word",
              }}>
                {text}
              </span>
            </div>
          );
        })}
        {/* Show the optimistic user message if present */}
        {pendingUserMsg && (
          <div style={{ textAlign: "right", margin: "8px 0" }}>
            <span style={{
              display: "inline-block",
              background: "#0070f3",
              color: "#fff",
              borderRadius: 16,
              padding: "6px 14px",
              maxWidth: "80%",
              wordBreak: "break-word",
              opacity: 0.7,
            }}>
              {pendingUserMsg.content[0].text.value}
            </span>
          </div>
        )}
      </div>
      {/* Input form for sending new messages */}
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "8px 20px", borderRadius: 4, border: "none", background: "#0070f3", color: "#fff", cursor: "pointer" }}>Send</button>
      </form>
    </div>
  );
} 