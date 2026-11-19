import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// function param default with a doubly-nested SequenceExpression tail:
//   `function f({from} = (a(), (b(), Array)))`.
// the tail unwrap must recurse through both layers so synth-swap targets the innermost
// `Array` Identifier; both prefix expressions stay in the AST and run at call time.
function f({
  from
} = (a(), b(), {
  from: _Array$from
})) {
  return from([1]);
}
function g({
  keys
} = (c(), d(), {
  keys: _Object$keys
})) {
  return keys({});
}
export { f, g };