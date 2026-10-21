import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
{
  const [{
    from: f
  }, {
    Map: M
  }] = [pick ? Array : userObj, _globalThis];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof M);
}