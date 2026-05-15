# Contributing to BudgetBrain

## Getting Started

1. Fork the repo
2. Clone your fork
3. Install dependencies: `npm install && cd backend && npm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Code Style

- Use camelCase for JavaScript and React
- Keep components under 200 lines
- Use CSS variables for colors (no hardcoded values)
- No external CSS frameworks
- Comment complex logic only

## Pull Request Process

1. Use the PR template
2. Test your changes locally
3. Make sure the build passes: `npm run build`
4. Update docs if needed
5. Submit the PR for review

## Branch Naming

- `feature/feature-name` for new features
- `fix/bug-name` for bug fixes
- `docs/what-changed` for documentation updates

## Commit Messages

Keep them clear but short. Example:
- `feat: add budget category colors`
- `fix: handle null savedAmount in Goals`
- `docs: update API reference`

## Reporting Issues

Use GitHub Issues. Include:
- What you did
- What you expected
- What actually happened
- Screenshots if applicable
