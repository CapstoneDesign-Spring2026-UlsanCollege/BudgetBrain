# BudgetBrain Performance Notes

## Current Performance

- Frontend build: ~2 seconds with Vite
- Build output size: ~100 KB (minified)
- API response time: depends on MongoDB connection
- First load: React SPA loads quickly after initial bundle

## Optimizations Done

- Reduced dashboard API request load (batch requests)
- Vite tree-shaking for smaller bundles
- SWC compiler for faster builds
- In-memory DB fallback avoids connection delays in dev

## Areas to Improve

- Add lazy loading for route pages with React.lazy()
- Cache API responses with React Query
- Optimize Recharts rendering for large datasets
- Add pagination for expenses list
- Compress images and assets

## Build Size Breakdown

| Item | Size |
|---|---|
| Main JS bundle | ~80 KB |
| CSS | ~15 KB |
| Assets | ~5 KB |
| Total | ~100 KB |

## Vite Config Notes

- Using @vitejs/plugin-react-swc for fast refresh
- No code splitting yet
- Single bundle for all pages
- Proxy API in dev mode only
