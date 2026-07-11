// Runtime `self` / `window` aliases for the proxy-hop corpora: Node lacks both, so hop
// chains need live slots. The rig lives OUTSIDE the generated snippet - an in-module
// `globalThis.self = ...` write is a slot mutation under the mutated-statics canon and
// would legitimately turn off the very substitutions these corpora exist to compare
export function withRiggedAliases(fn) {
  const s = globalThis.self;
  const w = globalThis.window;
  globalThis.self = globalThis;
  globalThis.window = globalThis;
  try {
    return fn();
  } finally {
    globalThis.self = s;
    globalThis.window = w;
  }
}
