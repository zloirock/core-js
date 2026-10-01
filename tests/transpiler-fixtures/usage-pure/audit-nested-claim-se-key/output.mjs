import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a claim whose own KEY carries an effect is not the nested dispatch's to take: that dispatch
// DISCARDS the prop, and the effect goes with it, where the source runs it between the hop read and
// the bind. the shape goes to its flat twin instead - one memo the dispatch and the residual share,
// the key running in place off that memo - and where no twin is reachable the claim stays native
const log = [];
const box = {
  get inner() {
    _pushMaybeArray(log).call(log, 'hop');
    return [1, [2]];
  }
};
const folded = function () {
  const {
      inner: _ref
    } = box,
    m = null == _ref ? _ref[""] : (_pushMaybeArray(log).call(log, 'key'), _flatMaybeArray(_ref));
  return [typeof m, _joinMaybeArray(log).call(log)];
}();
// ... under a WRAPPER the array plan captures the literal's element in order and reads the hop off
// the capture - the key runs off that memo, once, between the literal and the bind
const wrapped = function () {
  const [_ref2] = [box],
    {
      inner: _ref3
    } = _ref2,
    m = null == _ref3 ? _ref3[""] : (_pushMaybeArray(log).call(log, 'wkey'), _flatMaybeArray(_ref3));
  return [typeof m, _joinMaybeArray(log).call(log)];
}();
// ... and a SLOT DEFAULT is carried, not mirrored: the twin's receiver folds both arms off one read,
// where a mirror of the default alone polyfills the arm that may never run and leaves the live one
// raw. the key still runs where the source wrote it - off the memo the fold bound
const defaulted = function () {
  const spare = [3];
  const {
      inner: _ref4 = spare
    } = box,
    m = null == _ref4 ? _ref4[""] : (_pushMaybeArray(log).call(log, 'dkey'), _flatMaybeArray(_ref4));
  return [typeof m, _joinMaybeArray(log).call(log)];
}();
// ... and beside an effect-bearing NEIGHBOUR element the capture keeps the source order: the literal
// builds whole (`n`), then the hop reads once and the key runs off that memo (`hop`, `ekey`)
const wrappedBesideAnEffect = function () {
  const [_ref5, _ref6] = [box, _pushMaybeArray(log).call(log, 'n')],
    {
      inner: _ref7
    } = _ref5,
    m = null == _ref7 ? _ref7[""] : (_pushMaybeArray(log).call(log, 'ekey'), _flatMaybeArray(_ref7)),
    zn = _ref6;
  return [typeof m, zn, _joinMaybeArray(log).call(log)];
}();
export { folded, wrapped, wrappedBesideAnEffect, defaulted };