import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// nested SE-key instance in a destructuring-ASSIGNMENT: the receiver is resolved through the object key
// (`{ y: arr }.y` -> arr) and the polyfill appended as a post-statement overwrite; the effect runs once
let m;
({
  y: {
    [(eff(), 'flat')]: m
  }
} = {
  y: arr
});
m = _flatMaybeArray(arr);