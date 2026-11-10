import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.join";
import "core-js/modules/es.string.includes";
// All reachable write values survive rewriting; a partial join retains its initializer.
let r;
const effects = [];
function f(c) {
  let x = [];
  if (c) x = [1, 2].join('-');else x = [];
  return x.includes('1');
}
r = [f(true), f(false)];