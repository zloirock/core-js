import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Property-object-type resolution for parameter destructure with annotation on the
// ObjectPattern itself (function param). The pattern.typeAnnotation branch resolves the
// destructured `items` directly as `number[]`, then `arr.findLast` and `arr.at` should
// narrow to array-specific dispatch. Nested bindings retain their declared receiver families too.
function process({
  items
}: {
  items: number[];
}) {
  _findLastMaybeArray(items).call(items, x => x > 0);
  _atMaybeArray(items).call(items, 0);
}
process({
  items: [1, 2, 3]
});
export function stringSlot(_ref, _unused = void 0) {
  let at = _atMaybeString(_ref.value);
  return at;
}
export function arraySlot(_ref2, _unused2 = void 0) {
  let includes = _includesMaybeArray(_ref2.value);
  return includes;
}