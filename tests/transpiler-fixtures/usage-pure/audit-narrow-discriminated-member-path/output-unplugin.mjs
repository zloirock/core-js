import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// discriminated union narrowing on a member path (`obj.d`) - guard `obj.d.kind === 'a'`
// restricts the union to the `string[]` arm and `.at(0)` resolves as Array.at
type U = { kind: 'a', data: string[] } | { kind: 'b', data: number };
declare const obj: { d: U };
if (obj.d.kind === 'a') {
var _ref;
  _globalThis.__r = _atMaybeArray(_ref = obj.d.data).call(_ref, 0);
}