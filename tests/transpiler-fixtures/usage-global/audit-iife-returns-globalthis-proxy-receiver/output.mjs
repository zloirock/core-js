import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// IIFE returning globalThis used as proxy-global receiver: the outer chain
// `<receiver>.Promise.resolve` has its receiver-chain collapsed to the polyfilled binding
// alone, and the rewrites INSIDE the IIFE body must survive that elimination
// (regression: this shape used to crash the transform)
(() => {
  return globalThis;
})().Promise.resolve(1);