# Project 1

## Enter Data Service


## Show Results Service

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

### server.js

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