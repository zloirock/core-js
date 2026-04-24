import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
// Destructuring where every key has a polyfill: the receiver `Promise` gets
// rewritten to an object literal with only polyfill ids, so no `_Promise` import
// is injected (leaking an unused `_Promise` would bloat the bundle).
// Two shapes covered: IIFE argument and default parameter.
(({
  resolve
}) => resolve)({
  resolve: _Promise$resolve
});
function fn({
  resolve,
  reject
} = {
  resolve: _Promise$resolve,
  reject: _Promise$reject
}) {
  return [resolve, reject];
}