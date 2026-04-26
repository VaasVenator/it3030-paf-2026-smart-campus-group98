# Smart Campus Operations Hub

Spring Boot REST API + React web application for the IT3030 PAF 2026 assignment.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.5.6 |
| Persistence | Spring Data MongoDB (MongoDB Atlas) |
| Security | Spring Security 6.5.9, Spring OAuth2 Client & Resource Server |
| Build | Maven (Wrapper), Lombok |
| Frontend | React 18, React Router v6, Vite 5 |
| CI | GitHub Actions |

## Implemented Modules

### Module A — Facilities & Assets Catalogue

- Create, list, update, and delete campus resources
- Resource metadata: type, capacity, location, availability window, status, amenities list
- Search, filtering, sorting, and paging support
- Resource types: `ROOM`, `LAB`, `EQUIPMENT`, etc.
- Resource statuses: `AVAILABLE`, `UNAVAILABLE`, `UNDER_MAINTENANCE`

### Module B — Booking Management

- Create booking requests for available resources
- Conflict detection — prevents overlapping bookings for the same resource
- Booking workflow: `PENDING → APPROVED / REJECTED → CANCELLED`
- Admin review actions (approve / reject with optional note)
- User-scoped and admin-wide booking visibility
- Update and cancel support

### Module C — Maintenance & Incident Ticketing

- Submit tickets with category, description, priority, and contact details
- Attachment count validation
- Technician assignment by admin
- Ticket workflow: `OPEN → IN_PROGRESS → RESOLVED → CLOSED` (admin can also `REJECT`)
- Ticket comments with ownership rules (author can edit/delete their own comments)
- Categories: `ELECTRICAL`, `PLUMBING`, `IT_SUPPORT`, `CLEANING`, `SECURITY`, `OTHER`
- Priorities: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

### Module D — Notifications

- Automated notifications on booking decisions (approved / rejected)
- Automated notifications on ticket status changes
- Notifications on new ticket comments
- List notifications per user
- Mark individual or all notifications as read
- Notification types: `BOOKING_APPROVED`, `BOOKING_REJECTED`, `TICKET_STATUS_CHANGED`, `TICKET_COMMENT_ADDED`

### Module E — Authentication & Authorization

- Student sign-up with `ITXXXXXXXX` Student ID format validation
- Login with BCrypt password hashing
- Google OAuth 2.0 sign-in flow with session bridging
- Role-based access control: `USER`, `ADMIN`, `TECHNICIAN`
- Protected frontend routes with persisted sign-in state via `localStorage`
- Profile view and update (name, contact info)
- Admin promotion utility scripts

## Project Structure

```text
.
├── frontend/                         # React client (Vite)
│   └── src/
│       ├── auth/                     # AuthContext, ProtectedRoute
│       ├── components/               # Header, Footer, Toast, ResourceForm, …
│       ├── hooks/                    # Custom React hooks
│       ├── lib/                      # API helpers
│       └── pages/
│           ├── HomePage.jsx
│           ├── AboutPage.jsx
│           ├── ContactPage.jsx
│           ├── LoginPage.jsx
│           ├── SignupPage.jsx
│           ├── OAuthSuccessPage.jsx
│           ├── DashboardPage.jsx
│           ├── ResourcesPage.jsx
│           ├── BookingsPage.jsx
│           ├── TicketsPage.jsx
│           ├── NotificationsPage.jsx
│           ├── ProfilePage.jsx
│           └── AdminDashboardPage.jsx
├── src/main/java/com/vaas/paf/
│   ├── auth/                         # Auth controller, service, model, DTOs
│   ├── booking/                      # Booking controller, service, model, DTOs
│   ├── ticket/                       # Ticket + comment controller, service, model, DTOs
│   ├── notification/                 # Notification controller, service, model, DTOs
│   ├── resource/                     # Resource controller, service, model, DTOs
│   ├── security/                     # AccessGuard, RequestUserContext, UserRole
│   └── config/                       # Security, CORS, seeders, filters
├── src/test/java/...                 # Unit and integration-style tests
├── .github/workflows/main.yml        # GitHub Actions CI
├── .env.example                      # Backend environment template
├── frontend/.env.example             # Frontend environment template
├── run-backend.sh                    # Convenience backend runner
├── make-admin.sh                     # Promote a user to ADMIN role
├── list-users.sh                     # List registered users
└── docs/                             # Requirements and architecture docs
```

## Local Setup

### 1. Backend environment

Copy `.env.example` to `.env` in the project root and fill in your values:

```env
SERVER_PORT=8080
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>?authSource=admin&retryWrites=true&w=majority&appName=Cluster0"
FRONTEND_BASE_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Frontend environment

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Run the backend

```bash
./run-backend.sh
```

Or manually:

```bash
./mvnw spring-boot:run -Dmaven.repo.local=.m2repo
```

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |

## Demo Accounts

Sign up through the UI with:

- **Student ID format**: `IT12345678` (IT + 8 digits)
- **Password**: minimum 8 characters

To promote a user to admin after sign-up:

```bash
./make-admin.sh <student-id>
```

To list all registered users:

```bash
./list-users.sh
```

## API Reference

| Prefix | Description |
|---|---|
| `POST /api/auth/signup` | Register a new student account |
| `POST /api/auth/login` | Authenticate and receive session identity |
| `GET /api/auth/me` | Get the currently signed-in user |
| `PUT /api/auth/me` | Update profile (name, contact) |
| `GET /api/auth/oauth2/google` | Initiate Google OAuth 2.0 flow |
| `GET /api/resources` | List / search / filter resources (paged) |
| `POST /api/resources` | Create a resource *(admin)* |
| `PUT /api/resources/{id}` | Update a resource *(admin)* |
| `DELETE /api/resources/{id}` | Delete a resource *(admin)* |
| `GET /api/bookings` | List bookings (user-scoped or all for admin) |
| `POST /api/bookings` | Create a booking request |
| `PUT /api/bookings/{id}` | Update a pending booking |
| `POST /api/bookings/{id}/review` | Approve or reject *(admin)* |
| `DELETE /api/bookings/{id}` | Cancel a booking |
| `GET /api/tickets` | List tickets (user-scoped or all for admin/tech) |
| `POST /api/tickets` | Submit a maintenance ticket |
| `PUT /api/tickets/{id}` | Update ticket details |
| `PUT /api/tickets/{id}/status` | Advance ticket status *(admin/technician)* |
| `POST /api/tickets/{id}/assign` | Assign technician *(admin)* |
| `GET /api/tickets/{id}/comments` | List comments on a ticket |
| `POST /api/tickets/{id}/comments` | Add a comment |
| `PUT /api/tickets/{ticketId}/comments/{commentId}` | Edit a comment *(author)* |
| `DELETE /api/tickets/{ticketId}/comments/{commentId}` | Delete a comment *(author/admin)* |
| `GET /api/notifications` | List notifications for the current user |
| `PUT /api/notifications/{id}/read` | Mark one notification as read |
| `PUT /api/notifications/read-all` | Mark all notifications as read |

## Testing

**Backend unit tests:**

```bash
./mvnw test -Dmaven.repo.local=.m2repo
```

**Frontend production build (smoke test):**

```bash
cd frontend
npm run build
```

## CI / CD

The GitHub Actions workflow (`.github/workflows/main.yml`) triggers on every push and pull request targeting `main` or `master` and:

1. Sets up JDK 17 (Temurin distribution)
2. Builds the project with Maven (`mvn -B package`)
3. Runs the full test suite (`mvn test`)

## OAuth Setup

To enable Google sign-in, add your credentials to the backend `.env` and register the following redirect URI in the Google Cloud Console:

```
http://localhost:8080/login/oauth2/code/google
```

Google sign-in lands on `/oauth-success` which bridges the OAuth session into the React auth context.
