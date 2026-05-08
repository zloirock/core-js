import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `tuple.length` is a number; positional indices keep their concrete element types.
// Verifies that the synthetic `length` member doesn't collide with positional element resolution.
type Pair = [string, number[]];
declare const t: Pair;
const len = t.length;
const x = _atMaybeArray(_ref = t[1]).call(_ref, 0);