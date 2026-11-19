import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A destructuring assignment in a parameter default retains its literal receiver.
// Reentry from the effectful key keeps each invocation's at and flat on its own array.
let calls = 0;
let inner;
let busy = false;
function reenter() {
  calls++;
  if (!busy) {
    busy = true;
    inner = read();
  }
}
function read(at, flat, value = {
  [(reenter(), 'at')]: at,
  flat
} = [calls + 1, [9]]) {
  return [at.call(value, 0), flat.call(value)[0], value];
}
export const result = [read(), inner, calls];