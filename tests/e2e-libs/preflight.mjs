// Full-env bundles may patch globals and leave timers running. Each gets its own disposable child.
import { runWithDeadline } from './deadline.mjs';

const child = new URL('./preflight-child.mjs', import.meta.url).href;

export function preflight(code, label) {
  return runWithDeadline(child, 'runPreflight', [code], { ms: 120_000, what: `${ label } pre-flight` });
}
