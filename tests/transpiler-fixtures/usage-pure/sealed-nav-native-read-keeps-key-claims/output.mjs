import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A sealed realm read keeps its native throw and visits every independent key claim.
// Static, instance, nested destructuring and loop-head claims inside the key remain live.
const log = [];
const {
  of: o1
} = (_globalThis.window?.[_pushMaybeArray(log).call(log, typeof _Object$keys), 'self']).Array;
const {
  of: o2
} = (_globalThis.window?.[(_pushMaybeArray(log) || 0).call(log, _findLastMaybeArray(_ref = [1, 2]).call(_ref, x => x)), 'self']).Array;
const {
  of: o3
} = (_globalThis.window?.[(() => {
  const sign = _Math$sign;
  _pushMaybeArray(log).call(log, typeof sign);
})(), 'self']).Array;
const {
  of: o4
} = (_globalThis.window?.[(() => {
  for (const {
    from
  } of [{
    from: _Array$from
  }]) _pushMaybeArray(log).call(log, typeof from);
})(), 'self']).Array;
const {
  of: o5
} = (_globalThis.window?.[(() => {
  for (const _ref2 in {
    x: 1
  }) {
    const at = _atMaybeString(_ref2);
    _pushMaybeArray(log).call(log, typeof at);
  }
})(), 'self']).Array;
export { log, o1, o2, o3, o4, o5 };