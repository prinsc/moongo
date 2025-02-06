"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 80;

server
  .listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  })
  .on("error", (err) => {
    console.error("Erreur lors du démarrage du serveur :", err);
  });

app.use("/jquery", express.static(path.join(__dirname, "node_modules/jquery/dist")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates/games/moongo.html"));
});

const moongoRep = io.of("/games/moongo");
const moongo = require("./src/games/moongo/index.js");

moongoRep.on("connection", (socket) => {
  socket.join("moongo");
  moongo.run(moongoRep, socket);
});
