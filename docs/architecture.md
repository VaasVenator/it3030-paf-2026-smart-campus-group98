# Architecture

## Overall System

```mermaid
flowchart LR
    A["React Client (Vite)"] --> B["Spring Boot REST API"]
    B --> C["MongoDB Atlas"]
    B --> D["Security + Validation + Workflow Services"]
    E["GitHub Actions CI"] --> B
    E --> A
```

## Backend Architecture

```mermaid
flowchart TD
    C["Controllers"] --> S["Services"]
    S --> R["Repositories"]
    R --> M["MongoDB Atlas"]
    C --> G["Global Exception Handler"]
    C --> V["Validation"]
    S --> N["Notification Service"]
    S --> A["Access Guard / User Context"]
```

### Layers

- Controllers expose REST endpoints and HTTP status codes.
- Services hold business rules such as booking conflicts and ticket transitions.
- Repositories access MongoDB collections.
- Shared components handle exceptions, validation, and request user identity.

## Frontend Architecture

```mermaid
flowchart TD
    App["App Router"] --> Auth["Auth Context"]
    App --> Pages["Pages"]
    Pages --> Components["Reusable Components"]
    Pages --> Hooks["useApi Hook"]
    Hooks --> Api["API Helper"]
    Api --> Backend["Spring Boot REST API"]
```

### Main UI Areas

- Login
- Sign up
- Dashboard
- Resources
- Bookings
- Tickets
- Notifications
- Profile

## Key Design Decisions

- MongoDB was selected for flexible document-based persistence.
- Booking conflicts are checked in the service layer before saving.
- Ticket workflow and comment ownership rules are enforced in backend services.
- Frontend auth state is stored locally to support protected views and profile actions.
