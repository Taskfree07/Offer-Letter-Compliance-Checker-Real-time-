FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application code (includes vector_store with 469 laws and state_laws_final)
COPY . ./

# Verify vector database is included
RUN echo "Checking vector database..." && \
    ls -la /app/vector_store/ && \
    echo "Vector database included successfully!"

# Verify state laws data is included
RUN echo "Checking state laws data..." && \
    ls /app/data/state_laws_final/*.json | wc -l && \
    echo "State laws data included!"

# GLiNER model will be downloaded on first use (cached in container)
# This avoids build timeouts and keeps the image build fast

# Create uploads directory for persistent storage
RUN mkdir -p /app/uploads/sessions

# Set environment variables for production
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV DEBUG=False

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000

# Use gunicorn for production with eventlet for WebSocket support
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "300", "--worker-class", "eventlet", "app:app"]
