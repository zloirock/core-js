import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  let x = [9].flat();
  if (c) x = 'ab';else x = 'cd';
  return x.at(-1);
}
r = [f(true), f(false)];