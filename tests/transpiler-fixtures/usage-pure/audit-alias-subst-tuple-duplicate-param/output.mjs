import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// tuple alias with sibling-position duplicates of an inner param; both slots narrow
// to the substituted shape when the outer alias is instantiated
type Pair<U> = [U, U];
type Box<T> = T[];
type Wrap<T> = Pair<Box<T>>;
declare const x: Wrap<number>;
_atMaybeArray(_ref = x[0]).call(_ref, 0);
_flatMaybeArray(_ref2 = x[1]).call(_ref2);