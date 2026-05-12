# Team Agreement - BudgetBrain

## Project
BudgetBrain - Capstone Design Project  
Ulsan College, Spring 2026

## Team Members & Roles

| Name | Role | Primary Responsibilities |
|------|------|------------------------|
| **Bidhan Pokhrel** | Frontend Lead / UI Engineer | React component architecture, CSS effects (3D/liquid/LED), savings goals feature, color palette design |
| **Suvakar Dahal** | Backend Lead / API Engineer | Express server setup, MongoDB integration, REST API routes (auth, budgets, expenses, goals), JWT authentication |
| **Sunil Tamang** | Documentation & Deployment Lead | README & sprint documentation, GitHub repository management, deployment (Railway/GitHub Pages), build verification |
| **Angnima Sherpa** | UI/UX Designer & Frontend Developer | Wireframes & mockups, login/register pages, expense tracking UI, analytics dashboard, responsive design |

## Mission Statement
To deliver a fully functional, visually polished budget planning application that demonstrates our collective proficiency in full-stack web development using modern JavaScript technologies.

## Communication Protocols
1. **Daily Standup** — 10:00 AM via Discord, max 15 minutes
2. **Task Tracking** — All tasks managed via GitHub Issues with labels (bug, enhancement, documentation)
3. **Code Reviews** — Every pull request requires at least one review from a different team member
4. **Decision Log** — Architectural decisions documented in project docs for future reference

## Code Standards
- **Naming**: camelCase for JavaScript/React files and variables
- **Frameworks**: Vanilla CSS only — no external CSS frameworks (Tailwind, Bootstrap, etc.)
- **State Management**: React Context + localStorage — no external state libraries
- **Component Size**: Keep under 200 lines; extract reusable logic into custom hooks
- **Comments**: Only for complex logic — prefer self-documenting code
- **Colors**: Use CSS custom properties from the shared palette rather than hardcoded values

## Git Workflow
- **Branches**: `feature/<name>` for new features, `fix/<name>` for bug fixes
- **Commits**: Use present-tense descriptive messages (e.g., "Add login form validation")
- **Main Branch**: Protected — no direct pushes; merge via pull requests only
- **Rebase Strategy**: Rebase feature branches onto main before merging to maintain linear history

## Quality Assurance
- All features must pass local build (`npm run build`) with zero errors
- API endpoints must be tested with curl before marking complete
- Console errors must be resolved before committing
- Responsive layout must be verified on mobile viewport widths

## Deadlines & Deliverables
| Artifact | Due Day | Owner |
|----------|---------|-------|
| Weekly Sprint Packet | Friday EOD | Sunil Tamang |
| Code Contributions | Thursday EOD | Assigned member |
| Sprint Documentation | Friday EOD | Assigned member |
| Final Presentation | TBD | All members |

## Conflict Resolution
1. Discuss issues during daily standup
2. If unresolved, escalate to the course professor
3. Majority vote on technical disagreements if consensus cannot be reached

## Sign-off
By contributing to this repository, each team member agrees to uphold the standards outlined in this document.
