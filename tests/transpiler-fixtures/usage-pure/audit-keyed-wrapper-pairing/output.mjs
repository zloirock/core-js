import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a wrapper standing under a KEY is one descent step further into the init literal: the pattern's
// key picks the property exactly as its slot picks an element, so the claim resolves through the
// mixed chain like it does under a bare wrapper. what the rows pin is the RECEIVER the dispatch
// reads - a descent that dropped a step would read the holder where the source reads the hop
const nb = {
  y: [1, [2]]
};
const nested = function () {
  const flat = _flatMaybeArray(nb.y);
  return flat;
}();
const flatClaim = function () {
  const flat = _flatMaybeArray(nb.y);
  return flat;
}();
// NEGATIVE: a NEIGHBOUR key that carries an effect pins the order - native builds the whole literal
// before it destructures, so a read moved to the pairing would step over that effect
const log = [];
const besideAnEffect = function () {
  const {
    pair: [{
      y: {
        flat
      }
    }],
    zn
  } = {
    pair: [nb],
    zn: _pushMaybeArray(log).call(log, 'n')
  };
  return [typeof flat, zn];
}();
export { nested, flatClaim, besideAnEffect };