# BudgetBrain Database Schema

The app uses MongoDB with Mongoose ODM. All models are in `backend/models/`.

## User Model

```
User {
  _id: ObjectId
  name: String (required)
  email: String (required, unique, lowercase)
  password: String (required, hashed with bcrypt)
  avatar: Number (default: 0)
  createdAt: Date (auto)
}
```

## Budget Model

```
Budget {
  _id: ObjectId
  user: ObjectId (ref: User, required)
  name: String (required)
  amount: Number (required, min: 1)
  color: String (default: "#1DBBC3")
  createdAt: Date (auto)
}
```

## Expense Model

```
Expense {
  _id: ObjectId
  budget: ObjectId (ref: Budget, required)
  user: ObjectId (ref: User, required)
  name: String (required)
  amount: Number (required, min: 1)
  date: Date (default: now)
  createdAt: Date (auto)
}
```

## Goal Model

```
Goal {
  _id: ObjectId
  user: ObjectId (ref: User, required)
  name: String (required)
  targetAmount: Number (required, min: 1)
  savedAmount: Number (default: 0, min: 0)
  deadline: Date
  createdAt: Date (auto)
}
```

## In-Memory Fallback

When MongoDB is unavailable, the server uses an in-memory array as fallback. This means data is lost when the server restarts. The in-memory fallback is only for development and demo purposes.
