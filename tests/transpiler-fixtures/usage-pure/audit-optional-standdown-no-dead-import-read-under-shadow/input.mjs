// A proven realm root and its optional window hop share one source of absence. A single guard covers the continuation and must not
// introduce unused imports.
const g = globalThis;
// the alias proof is scope-correct in BOTH directions. a module-level alias of the bare
// global read under a same-name param SHADOW still proves - the alias binds the module
// global, the shadow never feeds it
const h = g;
export function readUnderShadow(g) {
  return h.window?.self?.WeakMap;
}
