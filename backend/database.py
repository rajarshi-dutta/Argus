import os
from pymongo import MongoClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")

client = MongoClient(MONGO_URL)

db = client["robodog"]

users_collection = db["users"]
alerts_collection = db["alerts"]
password_resets_collection = db["password_resets"]

print("MongoDB Connected Successfully!")