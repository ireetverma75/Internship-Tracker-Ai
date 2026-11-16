"""
Main entrypoint for Internship Tracker AI API.
Allows running with either `uvicorn main:app` or `uvicorn app.main:app`.
"""
import sys
import os

# Ensure backend root is on sys.path
backend_root = os.path.dirname(os.path.abspath(__file__))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
