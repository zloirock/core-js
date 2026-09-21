import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Computed-key instance patterns read their member receiver once, then evaluate each key
// before its method read and subsequent siblings. Declarator and for-init hosts preserve
// the source slot, and an effectful sibling initializer runs before nested extraction.
const logv = [];
const holder = {
  p: [1, [2]]
};
var _ref = holder.p,
  m = null == _ref ? _ref[""] : (_pushMaybeArray(logv).call(logv, 1), _flatMaybeArray(_ref)),
  {
    other
  } = _ref;
export const r1 = [typeof m, typeof other, logv.length];
var x = 1,
  _ref2 = holder.p,
  a2 = null == _ref2 ? _ref2[""] : (_pushMaybeArray(logv).call(logv, 2), _atMaybeArray(_ref2)),
  {
    rest
  } = _ref2;
export const r2 = [typeof a2, typeof rest, x];
let out;
for (var _ref3 = holder.p, inc = null == _ref3 ? _ref3[""] : (_pushMaybeArray(logv).call(logv, 3), _includesMaybeArray(_ref3)), {
    tail
  } = _ref3; !out;) {
  out = typeof inc;
}
export const r3 = [out, typeof tail];
var _ref4 = holder.p,
  fm = null == _ref4 ? _ref4[""] : (_pushMaybeArray(logv).call(logv, 4), _flatMapMaybeArray(_ref4));
export const r4 = [typeof fm, logv.length];
const eff = [];
const _ref5 = {
    q: (_pushMaybeArray(eff).call(eff, 'se'), 1),
    p: holder.p
  },
  {
    q: qq
  } = _ref5,
  {
    p: _ref6
  } = _ref5,
  _ref7 = _ref6,
  m2 = null == _ref7 ? _ref7[""] : (_pushMaybeArray(eff).call(eff, 'key'), _flatMaybeArray(_ref7)),
  {
    other2
  } = _ref7;
export const r5 = [typeof m2, typeof other2, qq, _joinMaybeArray(eff).call(eff, ',')];