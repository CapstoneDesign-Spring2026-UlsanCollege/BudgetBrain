# BudgetBrain - Risks and Blockers

## Current Blockers

### Critical
- **Production email not configured**: Password reset and welcome emails require provider env vars in Vercel.

### Medium
- **PowerShell execution policy**: `Restricted` policy blocks `.ps1` scripts. Using `.cmd` variants as workaround.
- **MongoDB Atlas access**: Production depends on Atlas network access and valid Vercel env vars.

### Low
- **Express 5.x differences**: Route matching differs from Express 4. Tested and working.
- **Environment variables**: `.env` file is gitignored. Must be configured per deployment.

## Mitigation Strategies
| Risk | Mitigation |
|------|-----------|
| Production email missing | Configure `RESEND_API_KEY` and `PASSWORD_RESET_FROM` in Vercel |
| Vercel deployment | Keep root directory as repo root, framework Vite, output `dist` |
| MongoDB unavailable | Check `/api/health` and Atlas network access |
| PowerShell restriction | Use `npm.cmd` and `npx.cmd` |
| Data persistence | Use MongoDB Atlas for production |

## Monitoring
- Check build output for errors before deployment
- Test API endpoints with curl after deployment
- Verify CORS headers for cross-origin requests
