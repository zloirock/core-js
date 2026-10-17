import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
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