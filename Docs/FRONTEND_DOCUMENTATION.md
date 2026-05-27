# BudgetBrain Frontend Documentation

## Frontend Purpose

The BudgetBrain frontend provides a responsive, user-friendly interface for managing personal finances. It is a single-page application (SPA) built with React 18 that communicates with the Express.js backend through REST API calls. The frontend handles all user interactions, form validation, data visualization, and UI state management.

## Technology Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite 4 | Build tool and dev server |
| React Router v6 | Client-side routing |
| Axios | HTTP client for API calls |
| Recharts | Data visualization charts |
| Vanilla CSS | Styling with CSS variables |
| React Toastify | Notification toasts |

## Page Structure

### Login Page (`/login`)

- Email and password input fields
- Password visibility toggle
- "Forgot password?" link to password reset
- Link to register page for new users
- Form validation on submit
- Error messages for invalid credentials
- Success toast on login
- SVG illustration display

### Register Page (`/register`)

- Full name, email, password, and confirm password fields
- Password visibility toggle
- Live password strength rules display (min 8 chars, letter + number required)
- Form validation before submission
- Redirects to login page after successful registration (no auto-login)
- SVG illustration display

### Forgot Password Page (`/forgot-password`)

- Email input for password reset request
- Submits request to backend to send reset code via email
- Success/error feedback via toast notifications

### Reset Password Page (`/reset-password`)

- Email, 6-digit reset code, and new password fields
- Password strength validation
- Token-based password reset flow

### Dashboard Page (`/`)

- Welcome banner with user name
- Currency rate conversion widget
- Summary cards showing total allocated, total spent, and remaining funds
- Financial analytics charts (pie/bar charts via Recharts)
- Add expense form
- Create budget form
- Recent transactions table (last 5)
- Savings goals progress mini-cards
- Detailed budget breakdown with individual budget cards
- Empty state when no budgets exist

### Budget Page (`/budgets`)

- List of all budgets with progress bars
- Visual display showing spent vs allocated amounts
- Budget creation form
- Budget edit and delete functionality

### Expenses Page (`/expenses`)

- Full transaction history table
- Expense creation linked to budgets
- Expense edit and delete
- Category assignment per expense
- Sorting by date (newest first)

### Goals Page (`/goals`)

- Savings goal list with progress bars
- Goal creation form (name, target amount, deadline, icon)
- Add savings amount to existing goals
- Goal edit and delete
- Visual percentage progress display

### Profile Page (`/profile`)

- User name display and edit
- Email display (read-only)
- Avatar selection grid (12 emoji avatars)
- Current password verification
- Change password form

### Settings Page (`/settings`)

- Theme toggle (dark/light mode)
- Currency preference selection (NPR default)
- User preferences persistence in localStorage

### Analytics Page (`/analytics`)

- Detailed spending analytics (planned/expected)

## CSS Design

- CSS variables for theming (light and dark modes)
- Glass morphism card effects with backdrop blur
- 3D and liquid decorative effects
- Gradient backgrounds
- Smooth transitions and animations
- Consistent spacing and typography
- Responsive grid layouts

## Responsive / Mobile Design

- Mobile-first responsive approach
- Flexible grid layouts using CSS Grid and Flexbox
- Media queries for different screen sizes
- Touch-friendly input fields and buttons
- Scrollable tables on small screens
- Collapsible navigation on mobile

## JavaScript Responsibilities

- Form validation and error handling
- API communication via Axios interceptors
- JWT token management in localStorage
- User authentication state management
- Theme preference management
- Currency formatting and conversion
- Dynamic chart rendering
- Toast notifications for user feedback
- Loading states during API calls

## Frontend Validation and API Calls

- **Client-side validation:** Password strength, required fields, email format, and password confirmation are validated before form submission
- **API calls:** All CRUD operations use the Axios instance from `src/api.js`, which attaches JWT tokens automatically via an interceptor
- **Error handling:** API errors are caught and displayed as toast notifications. 401 responses trigger automatic logout
- **Loading states:** Buttons show spinner icons during API requests to prevent duplicate submissions
