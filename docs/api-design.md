# API Design

## Authentication
- POST /api/register
- POST /api/login
- POST /api/logout

## Applicants
- GET /api/applicant/profile
- POST /api/applications
- GET /api/applications/:id
- POST /api/applications/:id/documents

## Managers
- GET /api/applications
- GET /api/applications/:id
- PUT /api/applications/:id/status
- POST /api/announcements

## Residents
- GET /api/resident/dashboard
- POST /api/maintenance-requests
- GET /api/maintenance-requests
- GET /api/announcements
- POST /api/payments

## Notes
These endpoints are a draft and may change as the project is refined.
