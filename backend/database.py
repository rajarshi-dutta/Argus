import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)

db = client["robodog"]

users_collection = db["users"]
alerts_collection = db["alerts"]
password_resets_collection = db["password_resets"]

# MongoClient() is lazy -- it never actually connects until you run a real
# command. Ping here so a bad MONGO_URL fails loudly at startup instead of
# silently falling back to localhost and only breaking later mid-request.
try:
    client.admin.command("ping")
    print("MongoDB Connected Successfully!")
except (ConnectionFailure, ConfigurationError) as e:
    print("MongoDB Connection FAILED:", e)
    raise