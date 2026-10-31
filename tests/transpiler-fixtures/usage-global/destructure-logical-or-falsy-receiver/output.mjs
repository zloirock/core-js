import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// Falsy literals select the logical fallback before the pattern reads its methods.
// Each fallback uses a different method, so either missing import changes the set.
const {
  at
} = 0 || [1, 2];
const {
  includes
} = false || '12';
use(at, includes);