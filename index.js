const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');
const http = require("http"); // Import http module
const { Server } = require("socket.io"); // Import Socket.IO Server

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Create a server using the express app
const server = http.createServer(app);
// Initialize a new instance of Socket.IO
const io = new Server(server);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Set up Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Use routes
app.use("/api/user", userRoutes(io)); // Pass the io instance to userRoutes
app.use("/api/admin", adminRoutes);

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
