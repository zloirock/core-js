// a direct wks key shape-rebuilds through the DEFAULT synth: the slot spells the injected
// pure symbol binding and the value the method lookup (`[_Symbol$iterator]:
// _getIteratorMethod(Array)`), beside the plain sibling's static. caller-correct by
// construction (the literal evaluates only when the caller omits the argument), so no
// call-site visibility question arises - the old caller-lossy body-extract is retired here
function run({ [Symbol.iterator]: iter, from } = Array) {
  return from([1, 2, 3]);
}
run();
