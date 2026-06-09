import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// a nested instance method in a destructuring-ASSIGNMENT (`({ y: { flat: m } } = R)`): there is no
// declaration to extract a `const` into, so the polyfill is appended as `m = _flatMaybeArray(arr)` AFTER
// the statement. the destructure assigns m natively first (undefined on engines lacking the method), then
// this overwrite makes the polyfill win. statement context only - an expression-context assignment bails
const arr = [1, [2]];
let m;
({
  y: {
    flat: m
  }
} = {
  y: arr
});
m = _flatMaybeArray(arr);