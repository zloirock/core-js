import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// an `enum` / `namespace` declared in a loop BODY or a function body is scoped to that block: a use
// in the statement's HEAD - the loop test, the for-of subject, a parameter default - never sees it,
// so the global there keeps its polyfill. only a scope anchor's own list is a declaration's home; a
// statement holding a block is not that block's scope. a different global per head, so a head that
// wrongly reads the body's declaration loses exactly its own module
declare const src: any;
export function f(a = _Map$groupBy(src, (x: any) => x)) {
  enum Map {
    A
  }
  return a;
}
while (_Object$fromEntries(src)) {
  enum Object {
    B
  }
}
for (let i = 0; _Array$of(i); i++) {
  namespace Array {
    export const c = 1;
  }
}
do {
  enum Promise {
    D
  }
} while (_Promise$allSettled(src));
for (const v of _Reflect$ownKeys(src)) {
  enum Reflect {
    E
  }
}