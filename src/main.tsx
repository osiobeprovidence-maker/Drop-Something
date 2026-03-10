import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

// Primary: Vite env baked at build-time. Secondary: runtime override via
// `window.__CONVEX_URL` or a `<meta name="convex-url" content="...">`.
const bakedConvexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
function readRuntimeConvexUrl(): string | null {
  try {
    const w = (window as any).__CONVEX_URL;
    if (typeof w === 'string' && w) return w;
    const m = document.querySelector('meta[name="convex-url"]');
    if (m) return m.getAttribute('content');
  } catch {
    // ignore
  }
  return null;
}
const convexUrl = (readRuntimeConvexUrl() || bakedConvexUrl) as string | undefined;

function renderMissingEnv(message: string) {
  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;display:flex;align-items:center;justify-content:center;height:100vh;padding:24px;box-sizing:border-box;">
      <div style="max-width:700px;text-align:center;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#111">App misconfigured</h1>
        <p style="margin:0 0 8px;color:#333">${message}</p>
        <pre style="text-align:left;background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto;border:1px solid #e1e4e8">VITE_CONVEX_URL is not defined</pre>
      </div>
    </div>
  `;
}

if (!convexUrl) {
  // Defensive fallback for environments (like Vercel) missing Vite env vars at build time.
  // This avoids an unhelpful white screen and shows a clear message for quick debugging.
  // Ensure you set `VITE_CONVEX_URL` in your Vercel project settings (Environment Variables).
  // For more info: https://vercel.com/docs/environment-variables
  console.error('Missing VITE_CONVEX_URL environment variable');
  renderMissingEnv('Missing required environment variable: VITE_CONVEX_URL.\nPlease set it in your deployment environment (e.g. Vercel project settings).');
} else {
  try {
    const convex = new ConvexReactClient(convexUrl);

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </StrictMode>,
    );
  } catch (err: any) {
    // If the Convex URL is wrong or the client validation fails, render a helpful message
    console.error('Convex client initialization failed', err);
    renderMissingEnv(
      `Failed to initialize Convex client: ${err?.message ?? String(err)}\n` +
        'You can override the deployment URL at runtime by adding a meta tag ' +
        '<meta name="convex-url" content="https://your-deployment.convex.cloud">',
    );
  }
}
