import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// multi-element SE-key assignment: each element appends its own post-statement overwrite (`x = _m(arr)`),
// both re-referencing the receiver - neither binding is dropped
let x, y;
({
  [(e1(), 'flat')]: x,
  [(e2(), 'at')]: y
} = arr);
x = _flatMaybeArray(arr);
y = _at(arr);