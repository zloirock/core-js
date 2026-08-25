import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a direct wks key shape-rebuilds through the DEFAULT synth: the slot spells the injected
// pure symbol binding and the value the method lookup (`[_Symbol$iterator]:
// _getIteratorMethod(Array)`), beside the plain sibling's static. caller-correct by
// construction (the literal evaluates only when the caller omits the argument), so no
// call-site visibility question arises - the old caller-lossy body-extract is retired here
function run({
  [_Symbol$iterator]: iter,
  from
} = {
  [_Symbol$iterator]: _getIteratorMethod(Array),
  from: _Array$from
}) {
  return from([1, 2, 3]);
}
run();