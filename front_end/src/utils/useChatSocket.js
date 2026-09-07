import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  addIncomingMessage,
  updateMessageReaction,
  markConversationRead,
} from "../redux/slices/chatSlice";

export const useChatSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Connect to WebSocket server on ws://localhost:5000/ws?token=...
    const wsUrl = `ws://localhost:5000/ws?token=${encodeURIComponent(token)}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);

          if (type === "chat:new_message") {
            dispatch(addIncomingMessage(payload));
          } else if (type === "chat:reaction_updated") {
            dispatch(updateMessageReaction(payload));
          } else if (type === "chat:messages_read") {
            dispatch(markConversationRead(payload.conversationId));
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnection after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn("WebSocket connection warning:", err);
        ws.close();
      };
    } catch (e) {
      console.warn("WebSocket init warning:", e);
    }
  }, [dispatch]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  // Typing indicator trigger
  const sendTyping = useCallback((conversationId, recipientId, isTyping) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "chat:typing",
          payload: { conversationId, recipientId, isTyping },
        })
      );
    }
  }, []);

  return { isConnected, sendTyping };
};

export default useChatSocket;
