#!/usr/bin/env python3
"""
Setup script for ASL Translator
Downloads required models and creates necessary directories
"""

import os
import sys
import subprocess
import requests
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        sys.exit(1)

def create_directories():
    """Create necessary directories"""
    print("📁 Creating directories...")
    
    directories = [
        "uploads",
        "models",
        "temp"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def download_models():
    """Download pre-trained models"""
    print("🤖 Downloading models...")
    
    # This is a placeholder for actual model downloads
    # In production, you would download specific ASL recognition models
    print("ℹ️  Models will be downloaded automatically when first used")
    print("ℹ️  T5 model will be downloaded from Hugging Face")
    print("ℹ️  MediaPipe models are included in the package")

def check_dependencies():
    """Check if all dependencies are available"""
    print("🔍 Checking dependencies...")
    
    try:
        import cv2
        print("✅ OpenCV available")
    except ImportError:
        print("❌ OpenCV not available")
    
    try:
        import mediapipe
        print("✅ MediaPipe available")
    except ImportError:
        print("❌ MediaPipe not available")
    
    try:
        import tensorflow
        print("✅ TensorFlow available")
    except ImportError:
        print("❌ TensorFlow not available")
    
    try:
        import torch
        print("✅ PyTorch available")
    except ImportError:
        print("❌ PyTorch not available")
    
    try:
        import transformers
        print("✅ Transformers available")
    except ImportError:
        print("❌ Transformers not available")

def main():
    """Main setup function"""
    print("🚀 Setting up ASL Translator...")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Create directories
    create_directories()
    
    # Install requirements
    install_requirements()
    
    # Check dependencies
    check_dependencies()
    
    # Download models
    download_models()
    
    print("=" * 50)
    print("✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Run 'python main.py' to start the backend server")
    print("2. Open frontend/index.html in your web browser")
    print("3. Upload ASL videos for translation")
    print("\n🌐 Backend will be available at: http://localhost:5000")
    print("📊 API endpoints:")
    print("   - GET  /health - Health check")
    print("   - POST /upload - Upload video")
    print("   - GET  /models/status - Model status")
    print("   - POST /translate - Translate ASL text")

if __name__ == "__main__":
    main()
