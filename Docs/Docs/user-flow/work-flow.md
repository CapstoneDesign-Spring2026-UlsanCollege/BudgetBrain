# BudgetBrain — Conceptual User Flow Diagrams

This document explains the main user flow of the BudgetBrain project in a clear section-wise structure.

BudgetBrain helps users manage personal finance by tracking budgets, expenses, savings goals, and analytics.

---

## 1. Authentication Flow

This diagram shows how users register, log in, and enter the app.

```mermaid
flowchart LR
    Start([Start]) --> Landing[Landing Page]
    Landing --> AuthChoice{Choose Action}

    AuthChoice -->|New User| Register[Register Account]
    AuthChoice -->|Returning User| Login[Login]

    Register --> EnterInfo[Enter Name, Email, Password]
    EnterInfo --> CreateAccount[Create Account]
    CreateAccount --> Token[JWT Token Created]
    Token --> Dashboard[Dashboard]

    Login --> CheckLogin{Credentials Valid?}
    CheckLogin -->|Yes| Token
    CheckLogin -->|No| LoginError[Show Login Error]
    LoginError --> Login

    classDef terminal fill:#e8f5e9,stroke:#2e7d32,color:#111;
    classDef process fill:#f5f5f5,stroke:#666,color:#111;
    classDef decision fill:#fff8e1,stroke:#999,color:#111;
    classDef core fill:#e3f2fd,stroke:#1565c0,color:#111;

    class Start terminal;
    class Landing,Register,Login,EnterInfo,CreateAccount,Token,LoginError process;
    class AuthChoice,CheckLogin decision;
    class Dashboard core;
```

---

## 2. Main Dashboard Flow

This diagram shows the main areas users can access after logging in.

```mermaid
flowchart LR
    Dashboard[Dashboard]

    Dashboard --> BudgetArea[Budget Management]
    Dashboard --> ExpenseArea[Expense Tracking]
    Dashboard --> GoalArea[Savings Goals]
    Dashboard --> AnalyticsArea[Spending Analytics]
    Dashboard --> ProfileArea[Profile Settings]

    BudgetArea --> Budgets[View Budgets]
    ExpenseArea --> Expenses[View Expenses]
    GoalArea --> Goals[View Goals]
    AnalyticsArea --> Charts[View Charts]
    ProfileArea --> Profile[Profile / Avatar / Theme]

    classDef core fill:#e3f2fd,stroke:#1565c0,color:#111;
    classDef group fill:#f1f8e9,stroke:#558b2f,color:#111;
    classDef item fill:#f5f5f5,stroke:#666,color:#111;

    class Dashboard core;
    class BudgetArea,ExpenseArea,GoalArea,AnalyticsArea,ProfileArea group;
    class Budgets,Expenses,Goals,Charts,Profile item;
```

---

## 3. Budget Management Flow

This diagram shows how users create and manage budgets by category.

```mermaid
flowchart LR
    Dashboard[Dashboard] --> BudgetPage[Budget Page]
    BudgetPage --> Action{Choose Budget Action}

    Action -->|Create| AddBudget[Add Budget Category]
    Action -->|Edit| EditBudget[Edit Budget Amount]
    Action -->|Delete| DeleteBudget[Delete Budget]
    Action -->|View| ViewBudget[View Budget Details]

    AddBudget --> SaveBudget[Save Budget]
    EditBudget --> SaveBudget
    DeleteBudget --> UpdateList[Update Budget List]
    ViewBudget --> BudgetSummary[Budget Summary]

    SaveBudget --> BudgetSummary
    UpdateList --> BudgetSummary

    classDef process fill:#f5f5f5,stroke:#666,color:#111;
    classDef decision fill:#fff8e1,stroke:#999,color:#111;
    classDef result fill:#e8f5e9,stroke:#2e7d32,color:#111;

    class Dashboard,BudgetPage,AddBudget,EditBudget,DeleteBudget,ViewBudget,SaveBudget,UpdateList process;
    class Action decision;
    class BudgetSummary result;
```

---

## 4. Expense Tracking Flow

This diagram shows how users add and manage expenses inside their budgets.

```mermaid
flowchart LR
    Dashboard[Dashboard] --> ExpensePage[Expense Page]
    ExpensePage --> SelectBudget[Select Budget Category]
    SelectBudget --> ExpenseAction{Choose Expense Action}

    ExpenseAction -->|Add| AddExpense[Add Expense]
    ExpenseAction -->|Edit| EditExpense[Edit Expense]
    ExpenseAction -->|Delete| DeleteExpense[Delete Expense]
    ExpenseAction -->|View| ViewExpenses[View Expense List]

    AddExpense --> SaveExpense[Save Expense]
    EditExpense --> SaveExpense
    DeleteExpense --> UpdateExpenseList[Update Expense List]

    SaveExpense --> Recalculate[Recalculate Budget Balance]
    UpdateExpenseList --> Recalculate
    ViewExpenses --> ExpenseSummary[Expense Summary]
    Recalculate --> ExpenseSummary

    classDef process fill:#f5f5f5,stroke:#666,color:#111;
    classDef decision fill:#fff8e1,stroke:#999,color:#111;
    classDef result fill:#e8f5e9,stroke:#2e7d32,color:#111;

    class Dashboard,ExpensePage,SelectBudget,AddExpense,EditExpense,DeleteExpense,ViewExpenses,SaveExpense,UpdateExpenseList,Recalculate process;
    class ExpenseAction decision;
    class ExpenseSummary result;
```

---

## 5. Savings Goal Flow

This diagram shows how users create savings goals and track progress.

```mermaid
flowchart LR
    Dashboard[Dashboard] --> GoalPage[Savings Goal Page]
    GoalPage --> GoalAction{Choose Goal Action}

    GoalAction -->|Create| CreateGoal[Create Savings Goal]
    GoalAction -->|Update| UpdateGoal[Update Saved Amount]
    GoalAction -->|Delete| DeleteGoal[Delete Goal]
    GoalAction -->|View| ViewGoal[View Goal Progress]

    CreateGoal --> SaveGoal[Save Goal]
    UpdateGoal --> CalculateProgress[Calculate Progress]
    DeleteGoal --> RefreshGoals[Refresh Goal List]
    ViewGoal --> GoalProgress[Goal Progress]

    SaveGoal --> GoalProgress
    CalculateProgress --> GoalProgress
    RefreshGoals --> GoalPage

    classDef process fill:#f5f5f5,stroke:#666,color:#111;
    classDef decision fill:#fff8e1,stroke:#999,color:#111;
    classDef result fill:#e8f5e9,stroke:#2e7d32,color:#111;

    class Dashboard,GoalPage,CreateGoal,UpdateGoal,DeleteGoal,ViewGoal,SaveGoal,CalculateProgress,RefreshGoals process;
    class GoalAction decision;
    class GoalProgress result;
```

---

## 6. Analytics Flow

This diagram shows how BudgetBrain turns user data into spending insights.

```mermaid
flowchart LR
    Dashboard[Dashboard] --> AnalyticsPage[Analytics Page]

    AnalyticsPage --> CollectData[Collect Budget and Expense Data]
    CollectData --> ProcessData[Calculate Spending Summary]
    ProcessData --> CategoryBreakdown[Category Breakdown]
    ProcessData --> BudgetComparison[Budget vs Expense]
    ProcessData --> SavingProgress[Savings Progress]

    CategoryBreakdown --> Charts[Charts and Visual Reports]
    BudgetComparison --> Charts
    SavingProgress --> Charts

    Charts --> Insight[User Understands Spending Habits]

    classDef process fill:#f5f5f5,stroke:#666,color:#111;
    classDef result fill:#e8f5e9,stroke:#2e7d32,color:#111;
    classDef core fill:#e3f2fd,stroke:#1565c0,color:#111;

    class Dashboard,AnalyticsPage,CollectData,ProcessData,CategoryBreakdown,BudgetComparison,SavingProgress process;
    class Charts core;
    class Insight result;
```

---

## 7. Profile and Theme Flow

This diagram shows how users manage their profile, avatar, and theme preference.

```mermaid
flowchart LR
    Dashboard[Dashboard] --> ProfilePage[Profile Page]

    ProfilePage --> ProfileAction{Choose Setting}

    ProfileAction -->|Edit Profile| EditProfile[Update Profile Info]
    ProfileAction -->|Change Avatar| Avatar[Select Avatar]
    ProfileAction -->|Theme| Theme[Toggle Dark / Light Mode]
    ProfileAction -->|Logout| Logout[Logout]

    EditProfile --> SaveProfile[Save Changes]
    Avatar --> SaveProfile
    Theme --> ApplyTheme[Apply Theme]
    Logout --> End([End Session])

    SaveProfile --> ProfilePage
    ApplyTheme --> ProfilePage

    classDef process fill:#f5f5f5,stroke:#666,color:#111;
    classDef decision fill:#fff8e1,stroke:#999,color:#111;
    classDef terminal fill:#e8f5e9,stroke:#2e7d32,color:#111;

    class Dashboard,ProfilePage,EditProfile,Avatar,Theme,Logout,SaveProfile,ApplyTheme process;
    class ProfileAction decision;
    class End terminal;
```

---

## 8. Backend and Data Flow

This diagram shows how the frontend communicates with the backend and database.

```mermaid
flowchart LR
    User[User] --> Frontend[React + Vite Frontend]
    Frontend --> Routes[React Router Pages]
    Routes --> API[API Requests]

    API --> Backend[Express Backend]
    Backend --> Auth[JWT Authentication]
    Backend --> Controllers[Budget / Expense / Goal Logic]
    Controllers --> Database[(MongoDB Database)]

    Database --> Controllers
    Controllers --> Backend
    Backend --> API
    API --> Frontend
    Frontend --> User

    classDef user fill:#e8f5e9,stroke:#2e7d32,color:#111;
    classDef frontend fill:#e3f2fd,stroke:#1565c0,color:#111;
    classDef backend fill:#fff8e1,stroke:#999,color:#111;
    classDef database fill:#f3e5f5,stroke:#6a1b9a,color:#111;

    class User user;
    class Frontend,Routes,API frontend;
    class Backend,Auth,Controllers backend;
    class Database database;
```

---

## Summary

| Section | Purpose |
|---|---|
| Authentication Flow | Shows how users register and log in |
| Main Dashboard Flow | Shows the main app areas after login |
| Budget Management Flow | Shows how users create, edit, delete, and view budgets |
| Expense Tracking Flow | Shows how users manage expenses inside budgets |
| Savings Goal Flow | Shows how users create and track savings goals |
| Analytics Flow | Shows how user data becomes charts and insights |
| Profile and Theme Flow | Shows profile, avatar, theme, and logout options |
| Backend and Data Flow | Shows frontend, backend, authentication, and database connection |

---

_Last updated: May 2026_
