# Use an official lightweight Python runtime
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code into the container
COPY . .

# Start the Gunicorn server with Eventlet for WebSocket support.
# Cloud Run automatically assigns a port via the $PORT environment variable.
CMD exec gunicorn -k eventlet -w 1 --bind :$PORT app:app