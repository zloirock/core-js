import "core-js/modules/es.error.cause";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A nullable array-producing call in a parameter default can yield null.
// Capturing that receiver throws before its computed key or the function body.
let keys = 0;
function built() {
  return JSON.parse('true') ? null : [1, [2]];
}
function read(at, flat, value = {
  [(keys++, 'at')]: at,
  flat
} = built()) {
  return value;
}
export const result = (() => {
  try {
    read();
  } catch (error) {
    return [error instanceof TypeError, keys];
  }
})();