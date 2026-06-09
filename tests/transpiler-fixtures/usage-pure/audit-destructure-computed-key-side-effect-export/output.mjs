import _Array$from from "@core-js/pure/actual/array/from";
export const f = _Array$from;
// an EXPORTED side-effecting computed key. the extracted polyfill is emitted as its own `export const f`
// BEFORE the `export` keyword, and the residual destructure keeps its own export - so `f` is exported and
// the destructure (which still runs the effect) stays exported too. regressions: the old in-place lift
// left a dangling `export eff();` (syntax error in unplugin); and unplugin once inserted the binding
// between `export` and `const`, stealing the keyword and dropping the destructure out of the export
// (which silently dropped any real sibling binding - see the `-export-sibling` fixture). both agree now
export const {
  [(effectful(), 'from')]: _unused
} = Array;