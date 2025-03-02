FROM python:3.10

# Prevent Python from writing .pyc files and disable output buffering
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Update package list and install required compilers and JDK headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the project code into the container
COPY . /app/

# Use Gunicorn as the production server
CMD ["gunicorn", "onlinecompiler.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]