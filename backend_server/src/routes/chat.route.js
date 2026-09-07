const express = require("express");
const checkIfAuthenticated = require("../middleware");
const {
  getAuthorizedContacts,
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  reactToMessage,
} = require("../controller/chat");

const router = express.Router();

router.use(checkIfAuthenticated);

// Contact & conversation management
router.get("/contacts", getAuthorizedContacts);
router.get("/conversations", getConversations);
router.post("/conversations", getOrCreateConversation);

// Messages
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/messages", sendMessage);
router.post("/messages/:messageId/react", reactToMessage);

module.exports = router;
