# Smart Campus Operations Hub

Spring Boot REST API + React web application for the IT3030 PAF 2026 assignment.

## Stack

- Backend: Java 17, Spring Boot, Spring Data MongoDB, Spring Security
- Frontend: React, Vite, React Router
- Database: MongoDB Atlas
- Build tools: Maven, npm

## Implemented Modules

### Module A: Facilities & Assets Catalogue

- Create, list, update, and delete resources
- Resource metadata: type, capacity, location, availability window, status, amenities
- Search, filtering, sorting, and paging support

### Module B: Booking Management

- Create booking requests
- Prevent overlapping bookings for the same resource
- Booking workflow: `PENDING -> APPROVED/REJECTED -> CANCELLED`
- Admin review actions
- User-specific and admin-wide visibility

### Module C: Maintenance & Incident Ticketing

- Create tickets with category, description, priority, contact details
- Attachment limit validation
- Technician assignment
- Ticket workflow: `OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED`
- Admin rejection support
- Ticket comments with ownership rules

### Module D: Notifications

- Booking decision notifications
- Ticket status notifications
- Ticket comment notifications
- Notification list and mark-as-read support

### Module E: Authentication & Authorization

- Student sign up and login
- Student ID validation with `ITXXXXXXXX` format
- Password hashing with BCrypt
- Role-aware backend behavior for `USER`, `ADMIN`, and `TECHNICIAN`
- Protected frontend routes with persisted sign-in state

## Project Structure

```text
.
├── frontend/                 # React client
├── src/main/java/...         # Spring Boot API
├── src/test/java/...         # Unit and integration-style tests
├── .github/workflows/        # GitHub Actions CI
└── docs/                     # Requirements and architecture docs
```

## Local Setup

### 1. Backend environment

Create a root `.env` file based on `.env.example`.

Example:

```env
SERVER_PORT=8081
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>?authSource=admin&retryWrites=true&w=majority&appName=Cluster0"
```

### 2. Frontend environment

Create `frontend/.env` based on `frontend/.env.example`.

Example:

```env
VITE_API_BASE_URL=http://localhost:8081
```

### 3. Run the backend

```bash
./run-backend.sh
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- [http://localhost:5173](http://localhost:5173)

Backend URL:

- [http://localhost:8081](http://localhost:8081)

## Demo Accounts

Use the sign up page to create a user account with:

- Student ID format: `IT12345678`
- Password minimum length: `8`

The frontend stores the signed-in user locally and sends identity headers to the API for protected flows.

## Key API Areas

- `/api/auth`
- `/api/resources`
- `/api/bookings`
- `/api/tickets`
- `/api/notifications`

See [docs/requirements.md](/Users/sahanvaas/Documents/Y3S1/PAF/paf/docs/requirements.md) and [docs/architecture.md](/Users/sahanvaas/Documents/Y3S1/PAF/paf/docs/architecture.md) for details.

## Testing

Backend:

```bash
./mvnw test -Dmaven.repo.local=.m2repo
```

Frontend production build:

```bash
cd frontend
npm run build
```

## GitHub Actions

The CI workflow builds and tests both backend and frontend on each push and pull request.

## Current Note On OAuth

The project currently includes secure sign up/login, password hashing, role-aware routing, and protected flows. If your group must demonstrate Google OAuth specifically, add Google client credentials and extend the current auth layer with Spring Security OAuth2 login configuration before final submission.
