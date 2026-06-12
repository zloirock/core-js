import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref2;
// a string-literal outer key flattens like the identifier form (the key resolves through
// the canonical property-key resolver); residual siblings keep the quoted key valid
const from = _Array$from;
export const r1 = from([1]);
const keys = _Object$keys;
const {
  other
} = _globalThis;
export const r2 = [keys({
  a: 1
}), other];
// a rest sibling keeps the consumed string-literal key excluded via the quoted sentinel
const g8 = _Map$groupBy;
const {
  "Map": _unused,
  ...others
} = _globalThis;
export const r6 = [g8, others];
const e8 = _Object$entries;
const {
  ['Object']: _unused2,
  ...rest3
} = _globalThis;
export const r7 = [e8, rest3];
// a `_ref`-shaped user name must not shift the generated UID sequence
const _ref = 5;
export const r4 = _at(_ref2 = getArr()).call(_ref2, _ref);
// a paren-wrapped receiver reuses without a memo (the shared reusable-receiver gate)
export const r5 = _includes(arr)?.call(arr, 3);