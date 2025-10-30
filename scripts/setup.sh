#!/bin/bash
# Setup script to install Python dependencies for Eight Sleep integration

echo "🔧 Setting up Eight Sleep integration..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Install pip if not installed
if ! command -v pip3 &> /dev/null; then
    echo "📦 Installing pip..."
    sudo apt-get update
    sudo apt-get install -y python3-pip
fi

echo "✅ pip found: $(pip3 --version)"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r /home/ubuntu/sunday-planning-system/scripts/requirements.txt

echo "✅ Eight Sleep integration setup complete!"
echo ""
echo "Next steps:"
echo "1. Add EIGHT_EMAIL, EIGHT_PASSWORD, and EIGHT_TIMEZONE to Digital Ocean environment variables"
echo "2. Deploy the app"
echo "3. Navigate to Sleep Review tab and click 'Fetch Sleep Data'"
