#!/usr/bin/env python3
"""
ASL Translator Startup Script
This script helps you start the ASL translator system easily
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

def print_banner():
    """Print the ASL Translator banner"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🤟 ASL Translator 🤟                     ║
    ║                                                              ║
    ║         AI-Powered American Sign Language Translation        ║
    ║                                                              ║
    ║  Combining Computer Vision + Language Models for Accuracy   ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n🔍 Checking dependencies...")
    
    required_packages = [
        'flask', 'opencv-python', 'mediapipe', 'tensorflow', 
        'torch', 'transformers', 'numpy', 'pillow'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package}")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("   Run: pip install -r backend/requirements.txt")
        return False
    
    return True

def start_backend():
    """Start the backend server"""
    print("\n🚀 Starting ASL Translator Backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    try:
        # Check if main.py exists
        if not Path("main.py").exists():
            print("❌ main.py not found in backend directory")
            return False
        
        print("   Starting Flask server on http://localhost:5000")
        print("   Press Ctrl+C to stop the server")
        print("   " + "="*50)
        
        # Start the backend server
        subprocess.run([sys.executable, "main.py"])
        
    except KeyboardInterrupt:
        print("\n\n🛑 Backend server stopped")
        return True
    except Exception as e:
        print(f"\n❌ Error starting backend: {e}")
        return False
    finally:
        # Return to original directory
        os.chdir("..")
    
    return True

def open_frontend():
    """Open the frontend in the default browser"""
    print("\n🌐 Opening frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    dashboard_path = frontend_dir / "dashboard.html"
    if not dashboard_path.exists():
        print("❌ dashboard.html not found")
        return False
    
    try:
        # Convert to file URL
        dashboard_url = dashboard_path.absolute().as_uri()
        print(f"   Opening: {dashboard_url}")
        
        # Open in default browser
        webbrowser.open(dashboard_url)
        print("✅ Frontend opened in browser")
        return True
        
    except Exception as e:
        print(f"❌ Error opening frontend: {e}")
        return False

def main():
    """Main startup function"""
    print_banner()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        print("\n⚠️  Please install missing dependencies first")
        print("   Run: pip install -r backend/requirements.txt")
        sys.exit(1)
    
    print("\n✅ All dependencies are available!")
    
    # Ask user what they want to do
    print("\n🎯 What would you like to do?")
    print("1. Start backend server only")
    print("2. Open frontend only")
    print("3. Start backend and open frontend")
    print("4. Run setup (first time users)")
    
    while True:
        try:
            choice = input("\nEnter your choice (1-4): ").strip()
            
            if choice == "1":
                start_backend()
                break
            elif choice == "2":
                open_frontend()
                break
            elif choice == "3":
                print("\n🚀 Starting backend and opening frontend...")
                # Start backend in background
                backend_dir = Path("backend")
                os.chdir(backend_dir)
                
                try:
                    # Start backend process
                    backend_process = subprocess.Popen([sys.executable, "main.py"])
                    
                    # Wait a moment for server to start
                    print("   Waiting for backend to start...")
                    time.sleep(5)
                    
                    # Open frontend
                    os.chdir("..")
                    open_frontend()
                    
                    print("\n✅ Backend is running and frontend is open!")
                    print("   Backend: http://localhost:5000")
                    print("   Frontend: dashboard.html")
                    print("\n   Press Enter to stop the backend server...")
                    input()
                    
                    # Stop backend
                    backend_process.terminate()
                    print("🛑 Backend server stopped")
                    
                except Exception as e:
                    print(f"❌ Error: {e}")
                    if 'backend_process' in locals():
                        backend_process.terminate()
                
                break
            elif choice == "4":
                print("\n🔧 Running setup...")
                backend_dir = Path("backend")
                if backend_dir.exists():
                    os.chdir(backend_dir)
                    try:
                        subprocess.run([sys.executable, "setup.py"])
                    except Exception as e:
                        print(f"❌ Setup error: {e}")
                    finally:
                        os.chdir("..")
                else:
                    print("❌ Backend directory not found")
                break
            else:
                print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")
                
        except KeyboardInterrupt:
            print("\n\n🛑 Startup cancelled")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
            break

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Startup cancelled")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
