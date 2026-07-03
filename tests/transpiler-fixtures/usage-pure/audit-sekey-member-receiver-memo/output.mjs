import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _joinMaybeArray from "@core-js/pure/actual/array/instance/join";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// a side-effect-key destructure off a side-effect-free MEMBER receiver with a SURVIVING residual
// memoizes the receiver: the residual and the extraction read the shared binding, so a getter
// fires exactly once (like the native single read) and the polyfill lands. the memo joins a
// multi-declarator / for-init host as a preceding declarator at the source slot. an effectful
// slot elsewhere in the init disables the memo (hoisting the receiver read would observably
// reorder), leaving the destructure native
const logv = [];
const holder = {
  p: [1, [2]]
};
var _ref = holder.p,
  {
    [(_pushMaybeArray(logv).call(logv, 1), 'flat')]: _unused,
    other
  } = _ref,
  m = _flatMaybeArray(_ref);
export const r1 = [typeof m, typeof other, logv.length];
var x = 1,
  _ref2 = holder.p,
  {
    [(_pushMaybeArray(logv).call(logv, 2), 'at')]: _unused2,
    rest
  } = _ref2,
  a2 = _atMaybeArray(_ref2);
export const r2 = [typeof a2, typeof rest, x];
let out;
for (var _ref3 = holder.p, {
    [(_pushMaybeArray(logv).call(logv, 3), 'includes')]: _unused3,
    tail
  } = _ref3, inc = _includesMaybeArray(_ref3); !out;) {
  out = typeof inc;
}
export const r3 = [out, typeof tail];
var _ref4 = holder.p;
var fm = _flatMapMaybeArray(_ref4);
var {
  [(_pushMaybeArray(logv).call(logv, 4), 'flatMap')]: _unused4
} = _ref4;
export const r4 = [typeof fm, logv.length];
const eff = [];
const {
  q: qq,
  p: {
    [(_pushMaybeArray(eff).call(eff, 'key'), 'flat')]: m2,
    other2
  }
} = {
  q: (_pushMaybeArray(eff).call(eff, 'se'), 1),
  p: holder.p
};
export const r5 = [typeof m2, typeof other2, qq, _joinMaybeArray(eff).call(eff, ',')];