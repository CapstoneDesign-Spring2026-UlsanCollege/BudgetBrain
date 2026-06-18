# BudgetBrain Final Project Report

## Project title

**BudgetBrain: Personal Budget and Expense Planner**

## Team members

- Angnima Sherpa
- Sunil Tamang
- Bidhan Pokhrel
- Suvakar Dahal

## Project overview

BudgetBrain is a full-stack web application for students and young adults who want to plan budgets, record expenses, set savings goals, and understand spending patterns. The React interface communicates with a Java Spring Boot REST API. PostgreSQL stores all user and finance data through Spring Data JPA.

## Main features

- Account signup, login, logout, and profile editing
- Complete create, read, update, and delete workflows for budgets, expenses, and savings goals
- Keyword search and detailed expense filters
- Receipt-image upload, preview, persistent storage, and authenticated display
- Optional receipt text recognition through PaddleOCR with a browser fallback
- Spending charts, summaries, categories, and currency conversion
- Responsive dark and light user interface

## Technologies used

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Recharts |
| Backend | Java 21, Spring Boot 3, Spring Web, Spring Security |
| Database | PostgreSQL |
| Persistence | Spring Data JPA / Hibernate |
| Authentication | JWT and BCrypt password hashing |
| Deployment | Docker and Render Blueprint |
| Version control | Git and GitHub |

## Database design

BudgetBrain uses four main relational tables:

| Table | Important fields | Relationships |
|---|---|---|
| `app_users` | id, name, email, password, avatar | One user has many budgets, expenses, and goals |
| `budgets` | id, user_id, name, amount, color | Each budget belongs to one user and has many expenses |
| `expenses` | id, user_id, budget_id, name, amount, category, receipt_image | Each expense belongs to one user and one budget |
| `goals` | id, user_id, name, target_amount, saved_amount, deadline | Each goal belongs to one user |

Foreign keys enforce the ownership relationships. API queries also include the authenticated user ID so one user cannot access another user's records. Deleting a budget deletes its related expenses within a transaction.

## Screenshots

Add final screenshots from the deployed Render website before submission:

1. Registration or login page
2. Dashboard and charts
3. Budget CRUD workflow
4. Expense keyword search
5. Receipt upload preview and displayed receipt thumbnail
6. Savings goals page

## Development process

The team developed the application iteratively. The first version established React screens and finance workflows. Authentication and API-backed persistence were added next, followed by analytics, goals, responsive design, OCR, and validation. For final-project compliance, the backend was migrated to Spring Boot with PostgreSQL/JPA and the deployment was consolidated into a Render Docker service.

## Problems and solutions

### Protecting user data

Every private endpoint resolves the user from a signed JWT. Repository queries combine the resource ID with the user ID, preventing cross-account access.

### Relational migration

The original prototype used document storage. JPA entities and repositories replaced that layer, with explicit foreign keys for users, budgets, expenses, and goals.

### Image upload and display

Receipt images are validated in the browser and backend, stored with their media type in PostgreSQL, and served through an authenticated image endpoint. The interface shows a preview before submission and a thumbnail afterward.

### One-service deployment

A multi-stage Docker build compiles React first, copies the static files into Spring Boot, builds the Java application, and runs the resulting JAR. `render.yaml` provisions both the web service and PostgreSQL database.

## Conclusion

BudgetBrain demonstrates authentication, PostgreSQL/JPA persistence, CRUD operations, image upload and display, keyword search, responsive web design, GitHub version control, and Render deployment configuration. It gives users a practical way to manage budgets while demonstrating the full-stack concepts required by the course.
