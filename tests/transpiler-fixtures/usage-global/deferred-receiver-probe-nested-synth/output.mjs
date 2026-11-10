import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function getWin(cb) {
  cb();
  return globalThis.window;
}
const {
  resolve
} = getWin(() => {
  function f({
    from
  } = Array) {
    return from([7])[0];
  }
  eff(f());
})?.Promise;
r = typeof resolve;