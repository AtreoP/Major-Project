const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("New client connected");

  ws.on("message", (message) => {
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message); // Broadcast message to other clients
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

server.listen(3000, () => console.log("WebRTC Signaling Server running on port 3000"));
