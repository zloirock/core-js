import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// a deferred read sees the initializer and every write that can land before a later call, so
// its type is their union - and a disagreement between arms bails the whole set. folding with a
// bare reduce let the arm AFTER the disagreement re-seed the accumulator, so the answer depended
// on where the clash sat
let mixed = [1, 2];
let agreeing = [1, 2];
function read() {
  return [_at(mixed).call(mixed, 0), _includesMaybeArray(agreeing).call(agreeing, 1)];
}
mixed = 'abc';
mixed = [3, 4];
agreeing = [5, 6];
read();