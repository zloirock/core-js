import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref2;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const {
  "Array": {
    from
  }
} = {
  Array: {
    from: _Array$from
  }
};
export const r1 = from([1]);
const {
  "Object": {
    keys
  },
  other
} = {
  Object: {
    keys: _Object$keys
  },
  other: _globalThis.other
};
export const r2 = [keys({
  a: 1
}), other];
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
// Generated receiver names must not collide with the user's _ref binding.
const _ref = 5;
export const r4 = _at(_ref2 = getArr()).call(_ref2, _ref);
// A parenthesized identifier receiver needs no extra evaluation when its method is called.
export const r5 = _includes(arr)?.call(arr, 3);