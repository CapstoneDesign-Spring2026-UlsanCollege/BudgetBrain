# BudgetBrain FAQ

## General

**Q: What is BudgetBrain?**
A: A budget planning web app for college students to track expenses, manage budgets, and set savings goals.

**Q: Is it free?**
A: Yes, completely free and open-source.

**Q: Do I need an account?**
A: Yes, you need to register to save your data.

## Features

**Q: Can I create multiple budgets?**
A: Yes, you can create as many budgets as you want by category.

**Q: Can I track expenses?**
A: Yes, you can add expenses to each budget and see totals.

**Q: Is there a dark mode?**
A: Yes, you can switch between dark and light themes in Settings.

**Q: What currency does it use?**
A: Default is NPR (Nepalese Rupee). You can change it in Settings.

**Q: Can I set savings goals?**
A: Yes, you can create goals and track your savings progress.

## Technical

**Q: Is there a mobile app?**
A: Not yet. The web app is mobile-responsive though.

**Q: How is my data stored?**
A: Data is stored in MongoDB Atlas. Passwords are hashed with bcrypt.

**Q: Is my data safe?**
A: We use JWT tokens for authentication. No plain text passwords are stored.

**Q: Can I export my data?**
A: Not yet. This is a planned feature.

## Troubleshooting

**Q: I forgot my password. What do I do?**
A: Password reset is not available yet. This is a planned feature.

**Q: The app is slow. What should I do?**
A: Check your internet connection. The app needs a connection to the backend API.

**Q: My data disappeared.**
A: The in-memory database fallback loses data on server restart. Use MongoDB Atlas for persistence.
