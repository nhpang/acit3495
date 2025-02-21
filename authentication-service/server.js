const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

const allowedOrigins = ["http://localhost:7000", "http://localhost:4000"];

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

app.listen(5000, () => console.log("Authentication Service running on port 5000"));
