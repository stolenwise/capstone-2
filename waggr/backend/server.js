"use strict";

const app = require("./app");
const { PORT } = require("./config");

import cors from "cors";

app.use(cors({
  origin: [
    "https://waggr.onrender.com",     // ✅ your actual frontend Render URL
    "http://localhost:3000"           // ✅ keep for local dev
  ],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
