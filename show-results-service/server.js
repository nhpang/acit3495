const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const mongoClient = new MongoClient("mongodb://mongo:27017");

app.use(express.static(path.join(__dirname, "public")));

app.get("/results", async (req, res) => {
    await mongoClient.connect();
    const db = mongoClient.db("analytics_db");
    var stats = await db.collection("stats").find().toArray();
    const display = stats[stats.length - 1];
    res.json(display);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(7000, () => console.log("Show Results Service running on port 7000"));
