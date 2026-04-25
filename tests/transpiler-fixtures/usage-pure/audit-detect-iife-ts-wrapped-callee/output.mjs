import _Array$from from "@core-js/pure/actual/array/from";
// IIFE callee wrapped in `as any` - the destructured `from` still resolves against the
// `Array` argument and gets the static-method polyfill, same as a bare `(arrow)(Array)`
// invocation. TS expression wrappers between the arrow and its call site must not break
// IIFE recognition or the receiver-driven rewrite degrades to an inline-default
const r = ((({
  from
}) => from([1, 2, 3])) as any)({
  from: _Array$from
});
export { r };