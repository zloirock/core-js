import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
// IIFE caller-arg is a ConditionalExpression: `(({from}) => ...)(cond ? Array : Set)`.
// each viable branch should be rewritten to its own `{key: _Branch$key}` literal so
// the destructure picks up the polyfill regardless of which branch fires; non-viable
// branches (Set has no static `from` polyfill) stay raw and the constructor identifier
// still gets globally rewritten via the regular polyfill path
(({ from }) => from([1]))(cond ? { from: _Array$from } : _Set);