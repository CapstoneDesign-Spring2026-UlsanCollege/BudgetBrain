# BudgetBrain - Risks and Blockers

## Current Blockers

### Critical
- **GitHub Pages disabled**: Organization may have Pages disabled. Need alternative (Netlify/Vercel).
- **Backend not deployed**: API only runs locally. Need Railway/Render setup.

### Medium
- **PowerShell execution policy**: `Restricted` policy blocks `.ps1` scripts. Using `.cmd` variants as workaround.
- **In-memory DB fallback**: Data lost on server restart. Need MongoDB Atlas configured.

### Low
- **Express 5.x differences**: Route matching differs from Express 4. Tested and working.
- **Environment variables**: `.env` file is gitignored. Must be configured per deployment.

## Mitigation Strategies
| Risk | Mitigation |
|------|-----------|
| GitHub Pages disabled | Use Netlify for frontend hosting |
| Backend deployment | Railway with env vars configured |
| MongoDB unavailable | In-memory fallback works for demo |
| PowerShell restriction | Use `npm.cmd` and `npx.cmd` |
| Data persistence | Switch to MongoDB Atlas for production |

## Monitoring
- Check build output for errors before deployment
- Test API endpoints with curl after deployment
- Verify CORS headers for cross-origin requests
