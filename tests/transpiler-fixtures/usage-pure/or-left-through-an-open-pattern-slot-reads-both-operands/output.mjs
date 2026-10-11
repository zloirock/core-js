import _entries from "@core-js/pure/actual/instance/entries";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyDescriptors from "@core-js/pure/actual/object/get-own-property-descriptors";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
// a `||` / `??` or a presence test whose left reads a name a pattern binds to a slot holding no one certain
// value - one a write replaced or a call it escapes to may replace, one a spread may shift, one of a
// container a write may replace, and an alias of such a name - decides nothing: the slot may hold a falsy
// value, so the right is read too. a slot captured before its write, and one nothing writes, decide
const box = {
  C: _Map
};
box.C = null;
const {
  C: M
} = box;
export const grouped = (_ref = M || Object, _ref === Object ? _Object$groupBy : _ref.groupBy);
const held = {
  C: _Set
};
clobber(held);
const {
  C: S
} = held;
export const built = (_ref2 = S ?? Object, _ref2 === Object ? _Object$fromEntries : _ref2.fromEntries);
const slots = [_WeakMap];
slots[0] = null;
const [W] = slots;
export const owns = (_ref3 = typeof W == 'function' ? W : Object, _ref3 === Object ? _Object$hasOwn : _ref3.hasOwn);
const [, P] = [...extra, _Promise];
export const listed = (_ref4 = P || Object, _ref4 === Object ? _Object$values : _values(_ref4));
let pair = {
  C: _WeakSet
};
if (flag) pair = {
  C: null
};
const {
  C: Q
} = pair;
export const pairs = (_ref5 = Q || Object, _ref5 === Object ? _Object$entries : _entries(_ref5));
const N = M;
export const described = (_ref6 = N || Object, _ref6 === Object ? _Object$getOwnPropertyDescriptors : _ref6.getOwnPropertyDescriptors);
const late = {
  C: _Map
};
const {
  C: L
} = late;
late.C = null;
export const merged = _Map.assign;
const plain = {
  C: _Set
};
const {
  C: K
} = plain;
export const same = _Set.is;