// stamp `[core-js] [tag] ` on `error.message` for cross-pass file context. shared by
// babel-plugin (`withFileTag`) and unplugin (`runTransform` catch).
// idempotency uses `startsWith('[core-js] [${tag}]')` (anchored at message head). bare
// inner `[core-js]` prefix and mid-message `[tag]` occurrences do NOT block re-stamping -
// only an outer wrapper rethrow with identical tag at the head is skipped.
// reads + assignment wrap in try/catch: hostile `get message() { throw }` and frozen
// errors stay non-fatal (skip rather than unwind, preserving original identity)
export function tagError(error, tag) {
  if (typeof tag !== 'string' || error === null || error === undefined) return;
  let msg;
  try {
    msg = error.message;
  } catch { return; }
  if (typeof msg !== 'string') return;
  if (msg.startsWith(`[core-js] [${ tag }]`)) return;
  try {
    error.message = `[core-js] [${ tag }] ${ msg }`;
  } catch { /* swallow */ }
}
