import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$freeze from "@core-js/pure/actual/object/freeze";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// `Object.freeze` / `Object.seal` are identity statics (returnsArgument: 0): the result keeps the
// argument's concrete container type. A chained multi-type instance method (includes / at, present
// on Array AND String) therefore narrows to the ARRAY and injects es.array.*, not the registry's
// generic 'Object' result (which would drop the polyfill on ie:11). The string arg is the contrast:
// the same inference narrows it to String and injects es.string.* - the result is type-faithful, not
// a blanket array assumption. preventExtensions / setPrototypeOf share this returnsArgument:0 path.
const a: number[] = [1, 2, 3];
const s: string = 'xyz';
_includesMaybeArray(_ref = Object.freeze(a)).call(_ref, 2);
_atMaybeArray(_ref2 = Object.seal(a)).call(_ref2, 0);
_includesMaybeString(_ref3 = _Object$freeze(s)).call(_ref3, 'y');