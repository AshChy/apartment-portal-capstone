# Backend

This folder will contain:
- API endpoints
- Authentication logic
- Application processing
- Business logic

# Backend

This folder contains the backend for the Apartment Portal Capstone project.

## Current Setup

The backend is built with:

- Node.js
- Express

## How to Run

1. Open a terminal in the `backend` folder
2. Install dependencies if needed:

npm install

3. Start the server: npm start

The server will run at: http://localhost:3000

Current API Routes
Health Check
GET /api/health
Auth
POST /api/auth/login
Dashboard
GET /api/dashboard/tenant-dashboard
Maintenance
POST /api/maintenance/maintenance-request
Notes

Right now, the backend uses mock API responses for testing and development.

The next step will be connecting these routes to the SQLite database and integrating them with the frontend.