// stamp `[core-js] [tag] ` on `error.message` for cross-pass file context. shared by
// babel-plugin (`withFileTag`) and unplugin (`runTransform` catch) so a re-thrown error
// always carries the file id downstream toolchains expect.
//
// skips when:
// - `tag` is not a string (defensive against caller plumbing typos)
// - `error.message` is not a string (user Error subclass with object/array `message`,
//   AggregateError without overridden `message`, primitive `throw 'str'` whose caught
//   reference has no `.message` at all)
// - message already contains `[tag]` (idempotent: an outer wrapper rethrow would
//   otherwise double-stamp). a bare `[core-js]` prefix from inner user-callback errors
//   does NOT block tagging: re-stamping appends the file context once, leaving
//   `[core-js] [tag] [core-js] X` which keeps the user-callback identity while adding
//   the file marker.
//
// the `try/catch` around assignment swallows the TypeError from a sibling plugin's
// `Object.freeze(error)` (strict-mode assign to frozen prop) so the original error
// still propagates with its un-tagged message rather than being shadowed by a
// confusing assignment failure
export function tagError(error, tag) {
  const msg = error?.message;
  if (typeof tag !== 'string' || typeof msg !== 'string') return;
  if (msg.includes(`[${ tag }]`)) return;
  try { error.message = `[core-js] [${ tag }] ${ msg }`; } catch { /* frozen error */ }
}
