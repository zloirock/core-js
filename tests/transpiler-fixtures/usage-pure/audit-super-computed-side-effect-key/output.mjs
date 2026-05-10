import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `super[(fn(), 'try')]()` in static context: computed key carries a comma expression
// with a side-effect head. when the key resolves to a known static name and routes through
// the inherited-static remap, the prefix must NOT be dropped - it has to fire at the
// original evaluation point, before the polyfill call
let counter = 0;
function fn() {
  counter++;
  return null;
}
class C extends _Promise {
  static run() {
    return fn(), _Promise$try.call(this, () => 1);
  }
}
export { C, counter };