// an `enum` / `namespace` declared in a loop BODY or a function body is scoped to that block: a use
// in the statement's HEAD - the loop test, the for-of subject, a parameter default - never sees it,
// so the global there keeps its polyfill. only a scope anchor's own list is a declaration's home; a
// statement holding a block is not that block's scope. a different global per head, so a head that
// wrongly reads the body's declaration loses exactly its own module
declare const src: any;
export function f(a = Map.groupBy(src, (x: any) => x)) {
  enum Map { A }
  return a;
}
while (Object.fromEntries(src)) {
  enum Object { B }
}
for (let i = 0; Array.of(i); i++) {
  namespace Array { export const c = 1; }
}
do {
  enum Promise { D }
} while (Promise.allSettled(src));
for (const v of Reflect.ownKeys(src)) {
  enum Reflect { E }
}
