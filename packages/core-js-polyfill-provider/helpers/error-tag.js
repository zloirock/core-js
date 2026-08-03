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

// re-throw an outside failure under a `[core-js]` diagnostic without losing the original: a fresh
// Error so a readonly `.message`, a frozen Error or a primitive throw (`throw 'str'` / `42` / null)
// cannot swallow the diagnostic via a TypeError on reassignment. `cause` goes through the Error
// OPTION, not a post-hoc assignment: assigning it makes `cause` an OWN ENUMERABLE property, so the
// original payload leaks into `JSON.stringify(err)` / `{ ...err }` / a bundler's structured report
export function wrapWithCause(message, error) {
  return new Error(message, { cause: error });
}
