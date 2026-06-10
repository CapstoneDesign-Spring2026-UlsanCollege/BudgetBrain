# BudgetBrain Database Design

## Database Purpose

BudgetBrain uses MongoDB as its primary data store. MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents. The Mongoose ODM (Object Document Mapper) is used to define schemas, validate data, and interact with the database.

## Database Technology

| Property | Value |
|----------|-------|
| Database | MongoDB (via Mongoose ODM) |
| Cloud Hosting | MongoDB Atlas (planned/configured) |
| Local Alternative | Local MongoDB instance |
| Fallback | In-memory handling when unavailable |

## Data Models

### Users Collection

Stores user account information including authentication data.

```
User {
  _id: ObjectId              // Auto-generated unique identifier
  name: String               // User's full name (required, trimmed, 1-80 chars)
  email: String              // Email address (required, unique, lowercase)
  password: String           // Bcrypt-hashed password (required)
  avatar: String             // Emoji avatar (default: 🎯, max 16 chars)
  resetPasswordToken: String // SHA-256 hash of reset code (select: false)
  resetPasswordExpires: Date // Reset code expiration timestamp (select: false)
  resetPasswordAttempts: Number // Failed reset attempts counter (select: false)
  createdAt: Date            // Account creation timestamp (auto)
}
```

**Indexes:**
- `{ email: 1 }` (unique) — fast email lookup
- `{ resetPasswordToken: 1, resetPasswordExpires: 1 }` — password reset queries

### Budgets Collection

Stores budget categories with allocated amounts.

```
Budget {
  _id: ObjectId              // Auto-generated unique identifier
  user: ObjectId             // Reference to User (required)
  name: String               // Budget category name (required, trimmed, max 80 chars)
  amount: Number             // Allocated budget amount (required, min: 0)
  color: String              // Display color hex code (required, max 32 chars)
  createdAt: Date            // Budget creation timestamp (auto)
}
```

**Indexes:**
- `{ user: 1, createdAt: -1 }` — sort user budgets by creation date

### Expenses Collection

Stores individual expense records linked to budgets.

```
Expense {
  _id: ObjectId              // Auto-generated unique identifier
  user: ObjectId             // Reference to User (required)
  budget: ObjectId           // Reference to Budget (required)
  name: String               // Expense description (required, trimmed, max 120 chars)
  amount: Number             // Expense amount (required, min: 0)
  category: String           // Expense category (default: "other", max 40 chars)
  createdAt: Date            // Expense creation timestamp (auto)
}
```

**Indexes:**
- `{ user: 1, createdAt: -1 }` — sort user expenses by date
- `{ user: 1, budget: 1 }` — filter expenses by budget

### Goals Collection

Stores savings goals with progress tracking.

```
Goal {
  _id: ObjectId              // Auto-generated unique identifier
  user: ObjectId             // Reference to User (required)
  name: String               // Goal description (required, trimmed, max 120 chars)
  targetAmount: Number       // Target savings amount (required, min: 0)
  savedAmount: Number        // Amount saved so far (default: 0, min: 0)
  deadline: Date             // Optional target completion date
  icon: String               // Emoji icon for display (default: 🎯, max 16 chars)
  createdAt: Date            // Goal creation timestamp (auto)
}
```

**Indexes:**
- `{ user: 1, createdAt: -1 }` — sort user goals by creation date

## Model Relationships

```
User (1) ──< (N) Budget
  │
  ├── User (1) ──< (N) Expense
  │
  └── User (1) ──< (N) Goal
```

- **One user has many budgets:** Each budget belongs to exactly one user. Deleting a user would cascade to their budgets and expenses.
- **One user has many expenses:** Each expense is linked to a user and optionally to a budget.
- **One budget has many expenses:** When a budget is deleted, all associated expenses are also deleted.
- **One user has many savings goals:** Goals are independent of budgets and tracklong-term savings targets.

## Data Flow Examples

### Creating a Budget
1. Frontend sends `POST /api/budgets` with name, amount, color
2. Server validates input and creates a Budget document with `user` field set to the authenticated user's ID
3. Budget is saved to MongoDB
4. Server returns the created budget document

### Recording an Expense
1. Frontend sends `POST /api/expenses` with name, amount, budgetId
2. Server verifies the budget belongs to the authenticated user
3. Expense is created with references to both the user and budget
4. Dashboard can then compute spent vs allocated amounts by aggregating expenses per budget

### Tracking Savings Goals
1. Frontend creates a goal with `POST /api/goals` (name, targetAmount, deadline)
2. User periodically adds savings via `POST /api/goals/:id/savings` (amount)
3. Server increments `savedAmount` on the goal document
4. Frontend displays progress as a percentage (savedAmount / targetAmount x 100)

## Planned Collections

| Collection | Purpose | Status |
|------------|---------|--------|
| notifications | User notification history | Planned |
| categories | Predefined expense categories | Planned |
| analytics_cache | Aggregated spending analytics | Planned |
