import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$keys from "@core-js/pure/actual/object/keys";
var _ref2;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const from = _Array$from;
export const r1 = from([1]);
const keys = _Object$keys;
const {
  other
} = _globalThis;
export const r2 = [keys({
  a: 1
}), other];
const {
  "Map": {
    groupBy: g8
  },
  ...others
} = _globalThis;
export const r6 = [g8, others];
const {
  ['Object']: {
    entries: e8
  },
  ...rest3
} = _globalThis;
export const r7 = [e8, rest3];
// Generated receiver names must not collide with the user's _ref binding.
const _ref = 5;
export const r4 = _at(_ref2 = getArr()).call(_ref2, _ref);
// A parenthesized identifier receiver needs no extra evaluation when its method is called.
export const r5 = _includes(arr)?.call(arr, 3);