#!/bin/bash

# Create necessary directories
mkdir -p /app/uploads /app/generated

# Set proper permissions
chmod 755 /app/uploads /app/generated

# Ensure LaTeX cache directories exist
mkdir -p /tmp/texfonts
export TEXMFCACHE=/tmp/texfonts

# Start the application
exec npm run start:prod 