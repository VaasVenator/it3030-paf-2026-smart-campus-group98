# Requirements Specification

## Functional Requirements

### REST API

1. The system shall manage campus resources such as lecture halls, labs, meeting rooms, and equipment.
2. The system shall store resource metadata including type, capacity, location, availability window, status, and amenities.
3. The system shall support resource filtering by type, capacity, location, and status.
4. The system shall allow users to submit booking requests for resources.
5. The system shall prevent overlapping bookings for the same resource and time range.
6. The system shall support booking review actions by admins.
7. The system shall allow users to create maintenance and incident tickets.
8. The system shall limit ticket attachments to a safe, validated count.
9. The system shall support technician assignment and ticket workflow updates.
10. The system shall allow users and staff to add, edit, and delete comments according to ownership rules.
11. The system shall generate notifications for booking, ticket, and comment events.
12. The system shall allow students to register and log in securely.
13. The system shall expose user profile read, update, and delete operations.

### Client Web Application

1. The client shall provide login and sign up screens.
2. The client shall validate student ID format as `ITXXXXXXXX`.
3. The client shall validate password rules before submission.
4. The client shall provide a dashboard overview.
5. The client shall display resources, bookings, tickets, notifications, and profile views.
6. The client shall protect authenticated routes.
7. The client shall persist the signed-in user state.
8. The client shall allow profile editing and account deletion.

## Non-Functional Requirements

### Security

- Passwords shall be stored as hashes, not plain text.
- Input data shall be validated on both client and server.
- Protected routes shall require a signed-in user.
- Request authorization decisions shall be role-aware.
- Attachment metadata shall be validated and limited.

### Performance

- The API shall support filtered queries and paged responses for resource lists.
- The client shall avoid unnecessary reloads and use modular fetch helpers.

### Scalability

- The backend shall follow layered package separation.
- MongoDB persistence shall allow future schema growth.
- React components shall remain modular and reusable.

### Usability

- Navigation shall be clear and responsive.
- Error messages shall be human-readable.
- Forms shall display validation issues clearly.

## Role Model

- `USER`: books resources, creates tickets, comments, and manages own profile
- `ADMIN`: manages resources, reviews bookings, can reject tickets
- `TECHNICIAN`: handles assigned tickets and progress updates
