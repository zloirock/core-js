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
export { folded };