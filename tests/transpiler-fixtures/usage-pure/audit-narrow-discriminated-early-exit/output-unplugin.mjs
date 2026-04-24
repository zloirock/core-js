import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// discriminated union narrow via early-exit: `if (x.kind !== 'a') return;` excludes the
// 'b' branch for the rest of the function body. the subsequent `x.val.at(0)` must see the
// 'a' branch's `string[]` type and emit the Array-specific instance.at polyfill
type X = { kind: 'a'; val: string[] } | { kind: 'b'; val: number };
function f(x: X) {
var _ref;
  if (x.kind !== 'a') return;
  _atMaybeArray(_ref = x.val).call(_ref, 0);
}