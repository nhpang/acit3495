const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

const allowedOrigins = ["http://ec2-54-189-110-210.us-west-2.compute.amazonaws.com:7000", "http://ec2-54-189-110-210.us-west-2.compute.amazonaws.com:4000"];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"));
        }
    }
}));

const users = [{ username: "admin", password: "1234" }];

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: "Authenticated" });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

app.get("/stress", (req, res) => {
    const start = Date.now();
    while (Date.now() - start < 5000) {
        Math.sqrt(Math.random() * 10000);
    }
    res.send("CPU stress completed!");
});
app.listen(5000, () => console.log("Authentication Service running on port 5000"));
