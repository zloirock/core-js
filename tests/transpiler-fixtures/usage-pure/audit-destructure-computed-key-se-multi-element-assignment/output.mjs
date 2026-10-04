import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// An assignment with two effectful computed keys evaluates each key before reading
// its method. Both bindings share the original receiver and keep source order.
let x, y;
({} = arr), e1(), x = _flatMaybeArray(arr), {} = arr, e2(), y = _at(arr);