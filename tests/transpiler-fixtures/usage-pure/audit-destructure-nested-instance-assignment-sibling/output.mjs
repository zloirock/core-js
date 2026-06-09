import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a destructuring-ASSIGNMENT mixing a nested instance method with a top-level SIBLING binding. the sibling
// (`z`) stays in the residual destructure (assigned as usual), and the instance polyfill is appended as
// `m = _flatMaybeArray(arr)` AFTER the statement - the destructure assigns m natively first (undefined on
// engines lacking the method), then the overwrite wins. the sibling is untouched by the overwrite
const arr = [1, [2]];
let m;
let z;
({
  y: {
    flat: m
  },
  z
} = {
  y: arr,
  z: 9
});
m = _flatMaybeArray(arr);