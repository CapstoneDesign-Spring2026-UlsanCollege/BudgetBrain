# BudgetBrain — Final Presentation Outline

## 12 Slides

---

### Slide 1: Title
- Project name: BudgetBrain
- Tagline: Smart Finance Management for Students
- Team members, course, institution, date

### Slide 2: Problem
- College students struggle with budgeting
- Existing tools are too complex or require bank integration
- Need for a simple, accessible solution

### Slide 3: Target Users
- College and university students
- Young adults managing personal finances
- Anyone needing simple budget tracking

### Slide 4: Solution
- BudgetBrain: full-stack web application
- Track expenses, manage budgets, set savings goals
- Visual analytics and receipt scanning
- Free, open-source, live on Vercel

### Slide 5: Features
- Authentication (register/login/password reset)
- Budget and expense CRUD
- Savings goals with progress tracking
- Dashboard with analytics charts
- Dark/light theme toggle
- Receipt OCR scanning
- Currency conversion

### Slide 6: Architecture
- Three-tier architecture diagram
- React frontend → Express API → MongoDB
- JWT authentication flow
- Vercel deployment (static + serverless)

### Slide 7: Database / API
- Four MongoDB collections: users, budgets, expenses, goals
- RESTful API with 20+ endpoints
- Authentication middleware
- Error handling patterns

### Slide 8: Demo Flow
- Registration → Login → Dashboard
- Budget creation → Expense recording
- Savings goals → Analytics
- Theme toggle → Profile
- Receipt scanning

### Slide 9: Testing
- Manual testing with comprehensive checklists
- 90+ test cases across all features
- Build verification (0 errors)
- Cross-browser and responsive testing

### Slide 10: Deployment
- Vercel deployment pipeline
- Environment variables and configuration
- Live URL: budgetbrain.vercel.app
- CI/CD through GitHub integration

### Slide 11: Team Contribution
- Bidhan Pokhrel — Frontend Lead
- Suvakar Dahal — Backend Lead
- Sunil Tamang — Documentation & Deployment
- Angnima Sherpa — UI/UX Designer

### Slide 12: Future Work / Conclusion
- Bank integration and recurring transactions
- AI-powered spending insights
- Mobile app (React Native)
- Data export (CSV/PDF)
- Q&A
