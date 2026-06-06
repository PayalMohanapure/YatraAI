// ─── chat.js — Chat Widget UI Logic ───
//
// WHY: This creates the floating chat bubble on hotel show pages.
// Users click it to open a chat window and talk to our AI agents.
//
// HOW: Sends POST requests to /api/chat with the user's message,
// session ID, and current hotel ID. Displays the AI's response.
//
// INTERVIEW: "The chat widget generates a unique session ID per
// browser tab using crypto.randomUUID(). This maps to the server-side
// memory.js sliding window, giving each tab its own conversation."

// Generate unique session ID for this browser tab
const sessionId = crypto.randomUUID();

// Toggle chat open/closed
function toggleChat() {
  const chatBox = document.getElementById("chatBox");
  chatBox.classList.toggle("chat-open");

  // Auto-focus input when opened
  if (chatBox.classList.contains("chat-open")) {
    document.getElementById("chatInput").focus();
  }
}

// Send message to AI
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  // Show user's message in chat
  appendMessage("user", message);
  input.value = "";

  // Show typing indicator
  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sessionId,
        listingId: typeof listingId !== 'undefined' ? listingId : null
      })
    });

    const data = await response.json();
    hideTyping();

    if (data.error) {
      appendMessage("assistant", "Sorry, I'm having trouble right now. Try again!");
    } else {
      appendMessage("assistant", data.reply);
    }
  } catch (err) {
    hideTyping();
    appendMessage("assistant", "Connection error. Please try again.");
  }
}

// Add a message bubble to the chat
function appendMessage(role, text) {
  const container = document.getElementById("chatMessages");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-${role}`;

  // Convert markdown-style formatting to HTML
  // **bold** → <strong>bold</strong>
  // \n → <br>
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  bubble.innerHTML = html;
  container.appendChild(bubble);

  // Auto-scroll to latest message
  container.scrollTop = container.scrollHeight;
}

// Show "AI is typing..." indicator
function showTyping() {
  document.getElementById("typingIndicator").style.display = "flex";
}

function hideTyping() {
  document.getElementById("typingIndicator").style.display = "none";
}

// Allow sending with Enter key
document.getElementById("chatInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
