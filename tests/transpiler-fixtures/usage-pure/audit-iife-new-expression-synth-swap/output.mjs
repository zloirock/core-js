import _Array$from from "@core-js/pure/actual/array/from";
// `new` invocation of an arrow IIFE: the user code throws TypeError at runtime (arrows are
// not constructable), but the static rewrite still walks NewExpression the same way it walks
// CallExpression. receiver arg is rewritten so the static-method polyfill is wired before
// the eventual runtime failure
const r = new (({
  from
}) => from([1, 2, 3]))({
  from: _Array$from
});
export { r };