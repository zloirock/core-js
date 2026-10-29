import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A call-rooted realm receiver keeps its call before a residual member read.
// Folding the quiet hops must not discard or duplicate the call's effects.
const log = [];
function read() {
  _pushMaybeArray(log).call(log, 'call');
  return _globalThis;
}
const value = (_pushMaybeArray(log).call(log, 'prefix'), read(), _self).Math;
consume(value, log);