import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an `enum` / `namespace` declared in a loop BODY or a function body is scoped to that block: a use
// in the statement's HEAD - the loop test, the for-of subject, a parameter default - never sees it,
// so the global there keeps its polyfill. only a scope anchor's own list is a declaration's home; a
// statement holding a block is not that block's scope. a different global per head, so a head that
// wrongly reads the body's declaration loses exactly its own module
declare const src: any;
export function f(a = Map.groupBy(src, (x: any) => x)) {
  enum Map {
    A,
  }
  return a;
}
while (Object.fromEntries(src)) {
  enum Object {
    B,
  }
}
for (let i = 0; Array.of(i); i++) {
  namespace Array {
    export const c = 1;
  }
}
do {
  enum Promise {
    D,
  }
} while (Promise.allSettled(src));
for (const v of Reflect.ownKeys(src)) {
  enum Reflect {
    E,
  }
}