import "core-js/modules/es.promise.try";
// adjacent IIFE-style `} (` boundary across two top-level statements: the plugin must
// not misread it as a single call expression and break the polyfill rewrite.

let x = function () {
  return 42;
}(function () {
  Promise.try(() => 1);
})();