// Runtime `self` / `window` aliases for the proxy-hop corpora: Node lacks both, so hop
// chains need live slots. The rig lives OUTSIDE the generated snippet - an in-module
// `globalThis.self = ...` write is a slot mutation under the mutated-statics canon and
// would legitimately turn off the very substitutions these corpora exist to compare
// the realm global reached INDIRECTLY: the stripped realm deletes the `globalThis` binding (that is
// how a missed injection surfaces there), and this rig runs inside the polyfilled output too - so it
// uses the same `Function('return this')()` lookup the strip applier and core-js itself use. a rig
// that named the binding threw `ReferenceError` before the snippet ran, arming nothing
const REALM = Function('return this')();

export function withRiggedAliases(fn) {
  const s = REALM.self;
  const w = REALM.window;
  REALM.self = REALM;
  REALM.window = REALM;
  try {
    return fn();
  } finally {
    REALM.self = s;
    REALM.window = w;
  }
}
