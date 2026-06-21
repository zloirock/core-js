// function param default with a doubly-nested SequenceExpression tail:
//   `function f({from} = (a(), (b(), Array)))`.
// the tail unwrap must recurse through both layers so synth-swap targets the innermost
// `Array` Identifier; both prefix expressions stay in the AST and run at call time.
function f({ from } = (a(), (b(), Array))) {
  return from([1]);
}
function g({ keys } = (c(), (d(), Object))) {
  return keys({});
}
export { f, g };
