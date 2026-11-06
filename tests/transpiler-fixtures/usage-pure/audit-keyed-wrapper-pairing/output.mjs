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
  const {
    pair: [_ref]
  } = {
    pair: [nb]
  };
  const flat = _flatMaybeArray(_ref.y);
  return flat;
}();
const flatClaim = function () {
  const {
    pair: [_ref2]
  } = {
    pair: [nb.y]
  };
  const flat = _flatMaybeArray(_ref2);
  return flat;
}();
// a NEIGHBOUR key that carries an effect pins the order - native builds the whole literal before it
// destructures, so the pairing stays off and the element renames positionally after that effect
const log = [];
const besideAnEffect = function () {
  const _ref4 = {
    pair: [nb],
    zn: _pushMaybeArray(log).call(log, 'n')
  };
  const {
    pair: [_ref3]
  } = _ref4;
  const flat = _flatMaybeArray(_ref3.y);
  const {
    zn
  } = _ref4;
  return [typeof flat, zn];
}();
export { nested, flatClaim, besideAnEffect };