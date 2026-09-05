import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an assignment-form alias read in a LOOP BODY resolves the single unconditional write before the
// loop: the back-edge re-runs the read, never the write. a write INSIDE the loop can reach the next
// iteration's read, and a conditional write proves nothing - both keep the read native in the pure
// flavor. one global per row keeps every row's own module in the import set
export function whileBody() {
  let w;
  w = globalThis;
  while (w) {
    return w.Array.of(1);
  }
}
export function nestedLoops() {
  let x;
  x = globalThis;
  for (let i = 0; i < 2; i++) {
    while (i) {
      i--;
      return x.Object.fromEntries([]);
    }
  }
}
export function writeInsideLoop(c, other) {
  let y = globalThis;
  while (c()) {
    y.Map.groupBy([1], v => v);
    y = other;
  }
}
export function conditionalWrite(c) {
  let z;
  if (c()) z = globalThis;
  while (z) {
    return z.Promise.allSettled([]);
  }
}