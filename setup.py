#!/usr/bin/env python3
import sys
import os
from pathlib import Path

# Add project roots to Python path
project_root = Path(__file__).parent
backend_dir = project_root / "backend"

sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(project_root))

# Now import and run your app
if __name__ == "__main__":
    try:
        import uvicorn
        uvicorn.run("placa.main:placa", host="0.0.0.0", port=8000, reload=True)
    except ImportError as e:
        print(f"Error: {e}")
        print("Please install uvicorn: pip install uvicorn")
        sys.exit(1)