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
    pair: _ref
  } = {
    pair: [nb]
  };
  const [_ref2] = _ref;
  const flat = _flatMaybeArray(_ref2.y);
  return flat;
}();
const flatClaim = function () {
  const {
    pair: _ref3
  } = {
    pair: [nb.y]
  };
  const [_ref4] = _ref3;
  const flat = _flatMaybeArray(_ref4);
  return flat;
}();
// a NEIGHBOUR key that carries an effect pins the order - native builds the whole literal before it
// destructures, so the pairing stays off and the element renames positionally after that effect
const log = [];
const besideAnEffect = function () {
  const _ref6 = {
    pair: [nb],
    zn: _pushMaybeArray(log).call(log, 'n')
  };
  const {
    pair: [_ref5]
  } = _ref6;
  const flat = _flatMaybeArray(_ref5.y);
  const {
    zn
  } = _ref6;
  return [typeof flat, zn];
}();
export { nested, flatClaim, besideAnEffect };