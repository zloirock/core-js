import _Array$from from "@core-js/pure/actual/array/from";
// multi-decl flatten with sibling that locally shadows the receiver name via `var` inside
// a function body. `var` hoists to the enclosing function scope - `pushFunctionScope`
// must collect `var` bindings from the body, not just function params, so the inner
// reference resolves to the local var and skips polyfill rewrite
const from = _Array$from;
const y = (function () {
  var globalThis = 'shadow';
  return globalThis;
})();
export { from, y };