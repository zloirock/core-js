import _includes from "@core-js/pure/actual/instance/includes";
// `(arr?.includes)(1)` - parenthesized optional member followed by NON-optional call.
// native semantics: arr nullish -> `(undefined)(1)` throws TypeError ("not a function");
// arr defined -> calls `arr.includes(1)` with `this=arr` (Reference Type preserved through
// parens per ECMA spec). polyfill keeps the lookup-only rewrite `(arr == null ? void 0 :
// _includes(arr))(1)` because injecting `.call(arr, 1)` would silently swap throw-on-nullish
// for "no-op on nullish". this is the design tradeoff: outer-non-optional paren shapes
// preserve the throw at the cost of also losing `this`-binding on the success path
const v = (arr == null ? void 0 : _includes(arr))(1);