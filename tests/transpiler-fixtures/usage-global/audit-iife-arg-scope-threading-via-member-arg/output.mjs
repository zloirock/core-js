import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// a proxy-global MEMBER arg resolves at the call site through the shadow too
export const viaMemberArg = !function ({
  resolve
}, Promise) {
  return resolve;
}(globalThis.Promise);