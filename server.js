const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
  res.json({ status: "alive" });
});

app.use("/api", authRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
});
