import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c, d) {
  let x;
  if (c) x = d ? [1, [7]].flat() : 'ab'.padStart(3);else x = 'str';
  return x.at(-1);
}
r = [f(true, true), f(true, false), f(false, false)];