const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const companyRoutes = require("./routes/companyRoute");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Routes
app.use("/api", userRoutes);
app.use("/api", companyRoutes);
app.get("/",console.log("Hello world"));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
