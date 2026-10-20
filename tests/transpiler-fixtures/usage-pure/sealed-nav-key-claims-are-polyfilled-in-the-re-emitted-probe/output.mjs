import _Array$from from "@core-js/pure/actual/array/from";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _self from "@core-js/pure/actual/self";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// Claims inside a sealed nav's computed key are polyfilled in the probe the destructure re-emits: a static read, an
// instance call, a nested destructure and the destructures of both loop heads each land once, where the key runs.
const log = [];
const o1 = ((null == _globalThis.window ? void 0 : (_pushMaybeArray(log).call(log, typeof _Object$keys), _self)).Array, _Array$of);
const o2 = ((null == _globalThis.window ? void 0 : ((_pushMaybeArray(log) || 0).call(log, _findLastMaybeArray(_ref = [1, 2]).call(_ref, x => x)), _self)).Array, _Array$of);
const o3 = ((null == _globalThis.window ? void 0 : ((() => {
  const sign = _Math$sign;
  _pushMaybeArray(log).call(log, typeof sign);
})(), _self)).Array, _Array$of);
const o4 = ((null == _globalThis.window ? void 0 : ((() => {
  for (const {
    from
  } of [{
    from: _Array$from
  }]) _pushMaybeArray(log).call(log, typeof from);
})(), _self)).Array, _Array$of);
const o5 = ((null == _globalThis.window ? void 0 : ((() => {
  for (const _ref2 in {
    x: 1
  }) {
    const at = _atMaybeString(_ref2);
    _pushMaybeArray(log).call(log, typeof at);
  }
})(), _self)).Array, _Array$of);
export { log, o1, o2, o3, o4, o5 };