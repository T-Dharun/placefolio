const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const companyRoutes = require("./routes/companyRoute");
const offerRoutes = require("./routes/offerRoute");

const app = express();

// Middleware
app.use(cors({
    origin:[ "https://placefolio.vercel.app" ,"http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  
app.use(bodyParser.json());
// Routes
app.use("/api", userRoutes);
app.use("/api", companyRoutes);
app.use("/api", offerRoutes);
app.get("/",(req,res)=>res.send("Welcome to the server!"));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
