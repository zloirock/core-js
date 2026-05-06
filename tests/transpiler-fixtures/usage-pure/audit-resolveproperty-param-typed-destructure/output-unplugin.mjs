import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// resolvePropertyObjectType for parameter destructure with annotation on the
// ObjectPattern itself (function param). The pattern.typeAnnotation branch resolves the
// destructured `items` directly as `number[]`, then `arr.findLast` and `arr.at` should
// narrow to array-specific dispatch. Distinct methods so each emit traces to its line
function process({ items }: { items: number[] }) {
  _findLastMaybeArray(items).call(items, x => x > 0);
  _atMaybeArray(items).call(items, 0);
}
process({ items: [1, 2, 3] });