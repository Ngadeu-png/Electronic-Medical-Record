const url = require("url");
const jwt = require("jsonwebtoken");
const { secret_key } = require("../controller/auths");
const { User, Conversation, Message } = require("../models/db-models");

let WebSocketServer;
try {
  WebSocketServer = require("ws").WebSocketServer;
} catch (e) {
  console.warn("⚠️ 'ws' package not yet installed. Run 'npm install' in backend_server to enable WebSocket server.");
}

// Map: userId (string) -> Set of WebSocket instances
const connectedUsers = new Map();

/**
 * Send a real-time event to a specific user (all their active connections)
 */
const sendToUser = (userId, type, payload) => {
  if (!userId) return;
  const userSockets = connectedUsers.get(String(userId));
  if (userSockets && userSockets.size > 0) {
    const data = JSON.stringify({ type, payload });
    for (const client of userSockets) {
      if (client.readyState === 1) { // 1 = OPEN
        try {
          client.send(data);
        } catch (err) {
          console.error("Error sending to client:", err.message);
        }
      }
    }
  }
};

/**
 * Broadcast an event to both participants of a conversation
 */
const broadcastToConversation = (patientId, doctorId, type, payload) => {
  sendToUser(patientId, type, payload);
  sendToUser(doctorId, type, payload);
};

/**
 * Initialize the WebSocket Server on top of the Express/Node HTTP server
 */
const initChatWebSocket = (httpServer) => {
  if (!WebSocketServer) {
    console.warn("WebSocketServer unavailable: 'ws' module missing.");
    return null;
  }

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    try {
      const parsedUrl = url.parse(req.url, true);
      const token = parsedUrl.query?.token;

      if (!token) {
        ws.close(4001, "No token provided");
        return;
      }

      let decoded;
      try {
        decoded = jwt.verify(token, secret_key);
      } catch (err) {
        ws.close(4002, "Invalid or expired token");
        return;
      }

      const userId = String(decoded.user._id);
      ws.userId = userId;
      ws.userRole = decoded.user.role;
      ws.isAlive = true;

      // Register in connected users
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId).add(ws);

      // Send initial connection acknowledgement
      ws.send(JSON.stringify({ type: "connection:success", payload: { userId } }));

      // Ping-pong for keep-alive
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      // Handle incoming messages
      ws.on("message", async (rawMessage) => {
        try {
          const parsed = JSON.parse(rawMessage.toString());
          const { type, payload } = parsed;

          if (type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
            return;
          }

          // Typing indicator
          if (type === "chat:typing" && payload?.conversationId && payload?.recipientId) {
            sendToUser(payload.recipientId, "chat:typing", {
              conversationId: payload.conversationId,
              userId: ws.userId,
              isTyping: Boolean(payload.isTyping),
            });
          }

          // Read receipt
          if (type === "chat:read" && payload?.conversationId) {
            await Message.updateMany(
              { conversation: payload.conversationId, recipient: ws.userId, isRead: false },
              { $set: { isRead: true } }
            );
            if (payload.senderId) {
              sendToUser(payload.senderId, "chat:read", {
                conversationId: payload.conversationId,
                readerId: ws.userId,
              });
            }
          }
        } catch (err) {
          console.error("Error processing WebSocket message:", err.message);
        }
      });

      // Cleanup on disconnect
      ws.on("close", () => {
        const userSockets = connectedUsers.get(userId);
        if (userSockets) {
          userSockets.delete(ws);
          if (userSockets.size === 0) {
            connectedUsers.delete(userId);
          }
        }
      });

      ws.on("error", (err) => {
        console.error(`WebSocket error for user ${userId}:`, err.message);
      });
    } catch (connectionErr) {
      console.error("Error during WebSocket connection handshake:", connectionErr);
      ws.close(4000, "Handshake failure");
    }
  });

  // Heartbeat interval to clear dead sockets
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  console.log("✅ WebSocket Server initialized on path /ws");
  return wss;
};

module.exports = {
  initChatWebSocket,
  sendToUser,
  broadcastToConversation,
  connectedUsers,
};
