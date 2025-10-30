#!/bin/bash
# Digital Ocean deployment script
# Runs after npm install but before starting the app

echo "🚀 Running post-install setup..."

# Install Python dependencies for Eight Sleep integration
if [ -f "/workspace/scripts/requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install --user -r /workspace/scripts/requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "⚠️  No Python requirements.txt found, skipping..."
fi

echo "✅ Post-install setup complete!"
