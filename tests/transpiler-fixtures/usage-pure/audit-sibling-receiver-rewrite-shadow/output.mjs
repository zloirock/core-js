import _Array$from from "@core-js/pure/actual/array/from";
// destructure receiver `globalThis` shares its name with a function parameter in the
// sibling declarator. only the destructure-source identifier should be rewritten when
// the receiver is folded; the inner-function parameter is a distinct local binding
const from = _Array$from;
const y = function (globalThis) {
  return globalThis;
}(1);
export { from, y };