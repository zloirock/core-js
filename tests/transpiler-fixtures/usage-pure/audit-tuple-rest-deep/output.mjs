import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// deep tuple with rest: `[string, ...number[][]]` — findTupleElement walks
// elements, unwraps rest → extractElementAnnotation. Check substitution still works
// when tuple is inside a generic alias.
type Pair<T> = [string, ...T[]];
declare const t: Pair<number[]>;
_atMaybeString(_ref = t[0]).call(_ref, 0);
_atMaybeArray(_ref2 = t[1]).call(_ref2, 0);