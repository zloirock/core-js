import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
export function undecided() {
  let value = [1];
  if (globalThis.flag) value = 'abc';
  return value.at(0);
}