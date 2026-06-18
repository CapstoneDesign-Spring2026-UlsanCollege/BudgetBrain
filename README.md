# BudgetBrain

BudgetBrain is a full-stack budget planner built with React, Spring Boot, PostgreSQL, and Spring Data JPA.

## Required features

- Signup, login, logout, profile management, and password reset
- PostgreSQL persistence through JPA entities and repositories
- CRUD for budgets, expenses, and savings goals
- Receipt-image upload, preview, storage, and display
- Expense keyword search and filters
- Responsive dark/light interface
- GitHub source control and Render Blueprint deployment

## Technology

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Recharts |
| Backend | Java 21, Spring Boot 3, Spring Security |
| Database | PostgreSQL, Spring Data JPA, Hibernate |
| Authentication | JWT, BCrypt |
| Deployment | Docker, Render |

## Local development

Prerequisites: Node.js 22, Java 21, Maven, and PostgreSQL.

Legacy Vercel demo during the Render migration: https://budgetbrain.vercel.app

Create a PostgreSQL database named `budgetbrain`, then set these environment variables:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=budgetbrain
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=replace_with_at_least_32_random_characters
CLIENT_ORIGIN=http://localhost:5173
```

Start the Spring API:

```sh
cd spring-backend
mvn spring-boot:run
```

Start the React development server in another terminal:

```sh
npm install
npm run dev
```

Open `http://localhost:5173`.

## Tests and builds

```sh
npm test
cd spring-backend
mvn test
```

The former Express/MongoDB prototype remains in `backend/` only as project history. It is not part of the current build or deployment.

## Render deployment

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Render reads `render.yaml`, provisions PostgreSQL, builds `Dockerfile`, and deploys the application.
4. Set optional `PADDLEOCR_API_URL` and `PADDLEOCR_API_KEY` values if an OCR service is available.
5. After deployment, replace the `CLIENT_ORIGIN` value with the actual Render web-service URL if the generated name differs.

The frontend and API share one origin. Spring Boot serves the compiled React assets, so no separate frontend deployment is required.

## Documentation

- [Final report](Final%20Portfolio%20Information/FINAL_REPORT.md)
- [Database design](Docs/DATABASE_DESIGN.md)
- [API reference](Docs/API_REFERENCE.md)
- [Deployment guide](Docs/DEPLOYMENT_GUIDE.md)
