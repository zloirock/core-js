import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a pattern the SOURCE wrote EMPTY is not the emitter's to drop: nothing consumed it, so its
// initializer is a read the source performs and the declaration still owes - only a pattern this
// pipeline emptied itself leaves with its init
const log = [];
const arr = [3, [1, 2]];
const eff = () => {
  _pushMaybeArray(log).call(log, 'e');
  return arr;
};
const {} = eff();
const viaEmptyThenClaim = _atMaybeArray(eff());
const viaClaimThenEmpty = _atMaybeArray(eff());
const {} = eff(); // ... and the shapes that already agreed: the empty pattern alone, and beside a plain binding
const {} = eff();
const {} = eff(),
  viaPlainTail = 1;
export { viaEmptyThenClaim, viaClaimThenEmpty, viaPlainTail, log };