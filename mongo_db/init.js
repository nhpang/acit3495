db = db.getSiblingDB('analytics_db');

db.createCollection('stats');

print("Initialized 'stats' collection in 'analytics_db' database");
