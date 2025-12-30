#!/bin/bash
set -e

echo "🚀 Starting Email Automation Backend..."

# Initialize database
echo "📦 Initializing database..."
python init_database.py

# Start gunicorn
echo "🌐 Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:5000 --workers 1 --timeout 300 --worker-class sync --worker-tmp-dir /dev/shm app:app
