import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The retained key runs after the receiver prefix, including a read that may throw.
function realm() {
  return _globalThis.window;
}
export function read(log) {
  return (log('before'), missingReceiverPrefix, log('after'), _self)[log('key'), 'Math'].PI;
}