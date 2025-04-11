const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());

function connectToDB() {
    const db = mysql.createConnection({
      host: "mysql",
      user: "root",
      password: "nathan",
      database: "stats"
    });
  
    // sometimes mysql is not online by the time this runs, so run it again after a bit (5 seconds)
    db.connect((err) => {
      if (err) {
        console.log("Error connecting to MySQL, retrying...", err);
        setTimeout(connectToDB, 5000);
      } else {
        console.log("Connected to MySQL!");
      }
    });
  
    return db;
  }
  connectToDB();

app.post("/enter", async (req, res) => {
    const { username, password, value } = req.body;

    // check authentication
    const authResponse = await axios.post("http://ec2-54-189-110-210.us-west-2.compute.amazonaws.com:5000/login", { username, password });
    if (!authResponse.data.success) return res.status(401).json({ message: "Unauthorized" });

    const db = mysql.createConnection({
      host: "mysql",
      user: "root",
      password: "nathan",
      database: "stats"
    });

    // mysql data insert
    db.query("INSERT INTO speed_data (speed) VALUES (?)", [value], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Data entered successfully!" });
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(4000, () => console.log("Enter Data Service running on port 4000"));
