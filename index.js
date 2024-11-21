const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const aiPlanRouter = require("./routes/ai/aiPlan.route"); // Import AI routes

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
const cors = require('cors');
app.use(cors()); 


// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Routes
app.use("/api/ai-plan", aiPlanRouter); // AI Plan-related routes



// Default error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
