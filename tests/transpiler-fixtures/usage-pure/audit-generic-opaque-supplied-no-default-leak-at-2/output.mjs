import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// channel: explicit type-arg, present but unresolvable
function makeExplicit<T = number[]>(): T {
  return [] as any;
}
_atMaybeArray(_ref = makeExplicit<string[]>()).call(_ref, 0);