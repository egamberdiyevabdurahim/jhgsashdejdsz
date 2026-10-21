import type { NextConfig } from 'next'

/**
 * The React front end (mig-frontend-poc). During the transition the current app (the repo root, later backend/ in FastAPI) keeps the
 * API and the sign-in: everything under /api goes there unchanged, so the /api/v1 contract, Auth.js's cookies and its callbacks are the
 * ones in production today. The design files (public/d, public/runtime) are served from this app's own public/, committed here (the
 * legacy repo's bytes; scripts/sync-design.mjs refreshes them from it until cutover).
 */
const BACKEND = process.env.JG_BACKEND ?? 'http://localhost:3234'

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: process.cwd(),   // this app is its own root (frontend/), not the repo's (two lockfiles)
  devIndicators: false,          // the dev badge would sit in the fidelity screenshots
  reactStrictMode: false,        // the legacy bridge runs the design's scripts once; strict mode's double effect would run them twice in dev
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // pages this app does not have yet fall through to the current app (the strangler: one route at a time)
      fallback: [
        { source: '/api/:path*', destination: `${BACKEND}/api/:path*` },
        { source: '/media/:path*', destination: `${BACKEND}/media/:path*` },
        { source: '/:path*', destination: `${BACKEND}/:path*` },
      ],
    }
  },
  async headers() {
    return [
      // as the current app (root next.config.ts)
      { source: '/:path*', headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
      ] },
      { source: '/d/:app/media/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/d/:app/:kind(js|css)/:file*', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
      { source: '/runtime/:file*', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
    ]
  },
}
export default config
