# Retrospective - BudgetBrain Sprint

**Team:** Angnima Sherpa, Sunil Tamang, Bidhan Pokhrel, Suvakar Dahal

## What Went Well
- User authentication flow works smoothly
- Budget CRUD operations are stable
- UI looks professional with 3D/liquid effects
- Color palette is vibrant and extensible
- Frontend builds with zero errors

## What Could Improve
- Backend deployment not yet configured
- API URL hardcoded for localhost
- No automated test suite
- In-memory DB fallback means data loss on restart
- Some defensive null checks needed in React components

## Action Items
1. Deploy backend to Railway
2. Make API URL configurable via env variable
3. Add unit tests for API routes
4. Add proper error boundaries in React
5. Document API endpoints in README

## Lessons Learned
- Express 5.x has slightly different route matching than Express 4
- Vite build is very fast compared to Webpack
- CSS variables make theming much easier
- JWT auth is straightforward with Axios interceptors
