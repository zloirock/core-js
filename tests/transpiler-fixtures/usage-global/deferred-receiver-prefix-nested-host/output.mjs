import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
// A retained receiver keeps its child claims and source effects through deferred rendering.
export let r;
export const effects = [];
function eff(x) {
  effects[effects.length] = x;
}
function call(cb) {
  cb();
}
const {
  resolve
} = (call(() => {
  const {
    fromEntries
  } = Object;
  eff(fromEntries([["x", 7]]).x);
}), globalThis.window)?.Promise;
r = typeof resolve;