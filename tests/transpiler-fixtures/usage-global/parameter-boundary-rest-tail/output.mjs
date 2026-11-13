import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A plain rest binding cannot observe the preceding property read.
export function read({
  at
}, ...values) {
  return [at, values];
}