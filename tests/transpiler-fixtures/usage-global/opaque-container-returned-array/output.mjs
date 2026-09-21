import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// A yielded constructor selected by an unknown key needs only the named static in global.
// Pure guards Array, which has no whole-value ponyfill, before reading that static.
function box(value) {
  return [value];
}
export function read(key) {
  return box(Array)[key].from([1, 2]);
}