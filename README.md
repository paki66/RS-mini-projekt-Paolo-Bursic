# RS Mini Projekt - Chat Application

This project consists of a frontend (React) and backend (FastAPI) application.

## Prerequisites

- Node.js version 24 or higher
- Conda (Anaconda or Miniconda)
- Python 3.13
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/paki66/RS-mini-projekt-Paolo-Bursic.git
cd RS-mini-projekt-Paolo-Bursic
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/my-app

# Ensure you're using Node.js v24
# (use nvm or your preferred Node version manager)
node --version  # Should show v24.x.x

# Install dependencies
npm install

# Build the frontend
npm run build
```

### 3. Backend Setup

```bash
# Navigate back to project root
cd ../..

# Navigate to backend directory
cd backend

# Create conda environment from environment.yaml
conda env create -f environment.yaml -n checkpoint-1
# -n flag is optional here

# Activate the conda environment
conda activate RS-mini-projekt-Paolo-Bursic

# Navigate to the back to root
cd ..

# run setup.py
python3 setup.py
```

## Running the Application

### Backend
```bash
conda activate RS-mini-projekt-Paolo-Bursic
cd backend/placa/
uvicorn --reload main:placa
```

The backend will be available at `http://localhost:8000`

### Frontend
```bash
cd frontend/my-app
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
RS-mini-projekt-Paolo-Bursic/
├── frontend/my-app/          # React frontend application
├── backend/                  # FastAPI backend application
│   └── placa/               # Main backend module
├── README.md
└── API_SPEC.md              # API specification
```

## Additional Resources

- See [API_SPEC.md](API_SPEC.md) for API documentation
- See [backend/README.md](backend/README.md) for backend-specific details