import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Rest already makes arguments unmapped; no extra parameter may follow it.
export function read({
  at
}, value, ...tail) {
  value = 9;
  return [at, arguments[1], tail];
}