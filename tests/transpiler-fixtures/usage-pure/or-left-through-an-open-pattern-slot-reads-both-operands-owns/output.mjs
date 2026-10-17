import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref;
const slots = [_WeakMap];
slots[0] = null;
const [W] = slots;
export const owns = (_ref = typeof W == 'function' ? W : Object, _ref === Object ? _Object$hasOwn : _ref.hasOwn);