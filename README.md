# Real Estate Valuation Automation

A desktop application for automating real estate valuation adjustments using React (Electron) and Python.

## Features

- Interactive UI for property data input and analysis
- Automated valuation adjustments based on multiple criteria
- Data visualization with charts and tables
- Export functionality to Excel and PDF
- Persistent storage with PostgreSQL
- Containerized deployment with Docker

## Tech Stack

### Frontend
- React
- Electron
- TypeScript
- Material-UI
- Chart.js

### Backend
- Python (FastAPI)
- NumPy/Pandas
- PostgreSQL
- SQLAlchemy

### DevOps
- Docker
- GitHub Actions
- pytest

## Project Structure

```
.
├── frontend/           # Electron + React application
├── backend/           # Python FastAPI server
├── database/          # Database migrations and schemas
├── tests/            # Test suites
└── docker/           # Docker configuration files
```

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- Docker and Docker Compose
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd real-estate-valuation
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

4. Start the development environment:
```bash
docker-compose up -d
```

## Running the Application

### Development Mode
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
uvicorn main:app --reload
```

### Production Build
```bash
# Build the application
npm run build

# Start the application
npm start
```

## Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 