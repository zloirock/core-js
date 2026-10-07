import _Array$from from "@core-js/pure/actual/array/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// Other sources keep their rest exclusions and independently claimed statics.
// Behind the default's effect prefix a logical whose left the build serves folds to it: `.Array`, and
// `.Number`, a global core-js extends in place.
function effect() {}
function f({
  from: _unused,
  ...rest
} = (effect(), _self.Array)) {
  let from = _Array$from;
  return from([1]);
}
f();
function g({
  isInteger: _unused2,
  ...rest
} = (effect(), _self.Number)) {
  let isInteger = _Number$isInteger;
  return isInteger(1);
}
g();