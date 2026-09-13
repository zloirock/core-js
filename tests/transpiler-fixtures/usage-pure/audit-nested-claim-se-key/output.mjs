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
    _ref2 = _ref,
    m = null == _ref2 ? _ref2[""] : (_pushMaybeArray(log).call(log, 'key'), _flatMaybeArray(_ref2));
  return [typeof m, _joinMaybeArray(log).call(log)];
}();
// ... under a WRAPPER the twin lives in the literal's ELEMENT and the normalization reaches it, and
// where an effect-bearing NEIGHBOUR element would reorder that read the twin TRAILS the residual
// instead - either way the key runs off the memo, once, between the literal and the bind
const wrapped = function () {
  const [_ref3] = [box],
    {
      inner: _ref4
    } = _ref3,
    _ref5 = _ref4,
    m = null == _ref5 ? _ref5[""] : (_pushMaybeArray(log).call(log, 'wkey'), _flatMaybeArray(_ref5));
  return [typeof m, _joinMaybeArray(log).call(log)];
}();
// ... and a SLOT DEFAULT is carried, not mirrored: the twin's receiver folds both arms off one read,
// where a mirror of the default alone polyfills the arm that may never run and leaves the live one
// raw. the key still runs where the source wrote it - off the memo the fold bound
const defaulted = function () {
  const spare = [3];
  const {
      inner: _ref6 = spare
    } = box,
    _ref7 = _ref6,
    m = null == _ref7 ? _ref7[""] : (_pushMaybeArray(log).call(log, 'dkey'), _flatMaybeArray(_ref7));
  return [typeof m, _joinMaybeArray(log).call(log)];
}();
// the TRAILING twin, spelled out: the literal builds whole (`n`), the emptied pattern coerces the
// element, then the hop reads once and the key runs off that memo (`hop`, `ekey`)
const wrappedBesideAnEffect = function () {
  const [_ref8, _ref9] = [box, _pushMaybeArray(log).call(log, 'n')],
    {
      inner: _ref10
    } = _ref8,
    _ref11 = _ref10,
    m = null == _ref11 ? _ref11[""] : (_pushMaybeArray(log).call(log, 'ekey'), _flatMaybeArray(_ref11)),
    zn = _ref9;
  return [typeof m, zn, _joinMaybeArray(log).call(log)];
}();
export { folded, wrapped, wrappedBesideAnEffect, defaulted };