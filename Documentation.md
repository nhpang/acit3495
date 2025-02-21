# Project 1

## Enter Data Service
### Dockerfile
Install Node, Mysql12, Axios and Body-Parser from package.json

```Dockerfile
FROM node:18

COPY package.json ./
RUN npm install
```

```json
{
    "name": "enter-data-service",
    "version": "1.0.0",
    "description": "Service for users to enter data",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "mysql2": "^3.9.6",  
      "body-parser": "^1.20.2",
      "axios": "^1.3.5"
    }
  }
  
```

Create the node app (server.js) and expose onto port 4000

```Dockerfile
CMD ["node", "server.js"]
EXPOSE 4000
```

### enter-data-service/server.js
Create express app

```JavaScript
const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
```

Connects app to the mysql service

```JavaScript
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
```

Creates a post request to authentication to login
If the user credentials doesn't match, it won't

```JavaScript
app.post("/enter", async (req, res) => {
    const { username, password, value } = req.body;

    // check authentication
    const authResponse = await axios.post("http://authentication-service:5000/login", { username, password });
    if (!authResponse.data.success) return res.status(401).json({ message: "Unauthorized" });

```

If the user is logged in, it will get the value from the body

```JavaScript
const db = mysql.createConnection({
      host: "mysql",
      user: "root",
      password: "nathan",
      database: "stats"
    });
```

Commit ```value``` to the mysql database

```JavaScript
    // mysql data insert
    db.query("INSERT INTO speed_data (speed) VALUES (?)", [value], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Data entered successfully!" });
    });
});
```

Serves the html file (index.html) on the root route
Starts the Express server on port 4000

```JavaScript
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(4000, () => console.log("Enter Data Service running on port 4000"));

```

## Show Results Service
### Dockerfile
Install node.js and everything in package.json

```Dockerfile
FROM node:18

COPY package.json ./
RUN npm install
```

```json
{
    "name": "show-results-service",
    "version": "1.0.0",
    "description": "Service to fetch and show analytics results",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "mongodb": "^5.6.0",
      "body-parser": "^1.20.2"
    }
  }
  
```
It will create a node app (server.js) exposed to port 7000

```Dockerfile
CMD ["node", "server.js"]
EXPOSE 7000
```

### show-results-service/server.js
Create an express app and connect to mongodb

```JavaScript
const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();
const mongoClient = new MongoClient("mongodb://mongo:27017");
```

Create a GET endpoint that grabs the most recent stats from mongodb
```JavaScript
app.get("/results", async (req, res) => {
    await mongoClient.connect();
    const db = mongoClient.db("analytics_db");
    var stats = await db.collection("stats").find().toArray();
    const display = stats[stats.length - 1];
    res.json(display);
});
```

Displays the stats on index.html
```JavaScript
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
```

Creates Express app on port 7000

```JavaScript
app.listen(7000, () => console.log("Show Results Service running on port 7000"));
```

```JavaScript
app.get("/results", async (req, res) => {
    await mongoClient.connect();
    const db = mongoClient.db("analytics_db");
    var stats = await db.collection("stats").find().toArray();
    const display = stats[stats.length - 1];
    res.json(display);
});
```

## Authentication Service
### Dockerfile
Install node.js and everything in package.json

```Dockerfile
FROM node:18

COPY package.json ./
RUN npm install
RUN npm install cors
```

```json
{
    "name": "authentication-service",
    "version": "1.0.0",
    "description": "User authentication service",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "body-parser": "^1.20.2"
    }
  }
```

It will create a node app (server.js) exposed to port 5000

```Dockerfile
CMD ["node", "server.js"]
EXPOSE 5000
```

### authentication-service/server.js

Creates an express.js app including CQRS for controlling domain access

```JavaScript
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
```

CQRS will limit origins to only ```localhost:7000``` and ```localhost:4000```

```JavaScript
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
```

Creates a post request from the ```/login``` endpoint
Checks if user exists in users
If the credentials match, it will say you are authenticate
If the credentials don't match, it will say Inivalid Credentials

```JavaScript
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
```

The app is created on port 5000

```JavaScript
app.listen(5000, () => console.log("Authentication Service running on port 5000"));
```

## Analytics Service
In the Dockerfile:

Install Python, Flask, pymongo (python mongodb connection), mysql-connecter-python

```Dockerfile
FROM python:3.9
```

```Dockerfile
RUN pip install -r requirements.txt
RUN pip install flask pymongo mysql-connector-python
```

The packages needed are found in requirements.txt

```txt
Flask
pymysql
pymongo
```

It will create app.py and expose the app on port 6000

```Dockerfile
CMD ["python", "app.py"]
EXPOSE 6000
```

### App:
#### Flask app that calculate Max, Min, Avg

Create a connection to mongodb and root connection to mysql

```Python
mongo_client = MongoClient('mongodb://mongo:27017')  # Mongo container name
mongo_db = mongo_client['analytics_db']
mongo_collection = mongo_db['stats']
```

From the database, It will get the Max speed, Min speed and Average speed

```Python
cursor.execute("SELECT MAX(speed), MIN(speed), AVG(speed) FROM speed_data")
```

This data will be put into a dictionary and inserted into mongodb

```Python
mongo_data = {
    'max_speed': max_value,
    'min_speed': min_value,
    'avg_speed': int(avg_value)
}

mongo_collection.insert_one(mongo_data)
```