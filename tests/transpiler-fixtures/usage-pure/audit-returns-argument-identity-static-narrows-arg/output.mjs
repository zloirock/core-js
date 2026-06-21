import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// `Object.freeze` / `Object.seal` are identity statics (returnsArgument: 0): the result
// keeps the argument's concrete container type. a chained multi-type method (includes / at,
// on Array AND String) narrows the array arg to Array (injects es.array.*, not generic
// 'Object' which would drop the polyfill on ie:11) and the string arg to String
// (es.string.*). preventExtensions / setPrototypeOf share the returnsArgument:0 path.
const a: number[] = [1, 2, 3];
const s: string = 'xyz';
_includesMaybeArray(_ref = Object.freeze(a)).call(_ref, 2);
_atMaybeArray(_ref2 = Object.seal(a)).call(_ref2, 0);
_includesMaybeString(_ref3 = _Object$freeze(s)).call(_ref3, 'y');