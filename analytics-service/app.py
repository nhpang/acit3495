import mysql.connector
import time
from pymongo import MongoClient
from flask import Flask, request
import threading
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# mongodb setup
mongo_client = MongoClient('mongodb://mongo:27017')
mongo_db = mongo_client['analytics_db']
mongo_collection = mongo_db['stats']

# gather data from mysql, calculate, and send data to mongodb
def calculate():
        try:
            # login to mysql
            db_config = {
                'host': 'mysql',
                'user': 'root',
                'password': 'nathan',
                'database': 'stats'
            }

            connection = mysql.connector.connect(**db_config)

            if connection.is_connected():
                print("Connected to the database.")

                cursor = connection.cursor()

                # calculation
                cursor.execute("SELECT MAX(speed), MIN(speed), AVG(speed) FROM speed_data")

                result = cursor.fetchone()

                max_value = result[0]
                min_value = result[1]
                avg_value = result[2]

                print(f"Maximum Speed: {max_value}")
                print(f"Minimum Speed: {min_value}")
                print(f"Average Speed: {avg_value}")

                # insert into mongodb
                mongo_data = {
                    'max_speed': max_value,
                    'min_speed': min_value,
                    'avg_speed': int(avg_value)
                }

                mongo_collection.insert_one(mongo_data)
                print("Data inserted into MongoDB.")

                cursor.close()
                connection.close()
                print("Connection closed.")

        # error handling
        except mysql.connector.Error as err:
            print(f"Error: {err}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")


@app.route('/')
def start_calculation():
    calculate()
    return "201"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
