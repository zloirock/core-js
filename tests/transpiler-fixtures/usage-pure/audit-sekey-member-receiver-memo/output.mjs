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
  _ref2 = _ref,
  m = null == _ref2 ? _ref2[""] : (_pushMaybeArray(logv).call(logv, 1), _flatMaybeArray(_ref2)),
  {
    other
  } = _ref;
export const r1 = [typeof m, typeof other, logv.length];
var x = 1,
  _ref3 = holder.p,
  _ref4 = _ref3,
  a2 = null == _ref4 ? _ref4[""] : (_pushMaybeArray(logv).call(logv, 2), _atMaybeArray(_ref4)),
  {
    rest
  } = _ref3;
export const r2 = [typeof a2, typeof rest, x];
let out;
for (var _ref5 = holder.p, _ref6 = _ref5, inc = null == _ref6 ? _ref6[""] : (_pushMaybeArray(logv).call(logv, 3), _includesMaybeArray(_ref6)), {
    tail
  } = _ref5; !out;) {
  out = typeof inc;
}
export const r3 = [out, typeof tail];
var _ref7 = holder.p,
  fm = null == _ref7 ? _ref7[""] : (_pushMaybeArray(logv).call(logv, 4), _flatMapMaybeArray(_ref7));
export const r4 = [typeof fm, logv.length];
const eff = [];
const _ref8 = {
    q: (_pushMaybeArray(eff).call(eff, 'se'), 1),
    p: holder.p
  },
  {
    q: qq
  } = _ref8,
  {
    p: _ref9
  } = _ref8,
  _ref10 = _ref9,
  _ref11 = _ref10,
  m2 = null == _ref11 ? _ref11[""] : (_pushMaybeArray(eff).call(eff, 'key'), _flatMaybeArray(_ref11)),
  {
    other2
  } = _ref10;
export const r5 = [typeof m2, typeof other2, qq, _joinMaybeArray(eff).call(eff, ',')];