const User = require("../BACKEND/models/user");

const conversations = new Map(); // fallback for anonymous users

async function getHistory(sessionId) {
  if (/^[0-9a-fA-F]{24}$/.test(sessionId)) {
    const user = await User.findById(sessionId);
    if (user) return user.chatHistory;
  }
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }
  return conversations.get(sessionId);
}

async function addMessage(sessionId, role, content) {
  if (/^[0-9a-fA-F]{24}$/.test(sessionId)) {
    const user = await User.findById(sessionId);
    if (user) {
      user.chatHistory.push({ role, content });
      if (user.chatHistory.length > 6) {
        user.chatHistory.splice(0, 2);
      }
      await user.save();
      return;
    }
  }
  
  const history = await getHistory(sessionId);
  history.push({ role, content });
  if (history.length > 6) {
    history.splice(0, 2);
  }
}

async function buildMessages(sessionId, systemPrompt, ragContext) {
  const history = await getHistory(sessionId);
  const messages = [];

  messages.push({ role: "system", content: systemPrompt });

  if (ragContext) {
    messages.push({
      role: "system",
      content: `Here is real hotel data from our database:\n${ragContext}`
    });
  }

  messages.push(...history);
  return messages;
}

module.exports = { getHistory, addMessage, buildMessages };
