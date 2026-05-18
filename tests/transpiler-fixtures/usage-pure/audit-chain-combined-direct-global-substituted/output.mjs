import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// chain-combined OR-emit references the receiver text in multiple template slots
// (`null == X`, `null == (_ref = inner(X))`, `_ref.call(X, ...)`). a bare proxy-global
// receiver (`globalThis.flat?.()`) must be resolved to its polyfill binding BEFORE
// template construction - otherwise visitor-driven Identifier substitution patches only
// the AST-anchored occurrence and the duplicated text occurrences strand raw `globalThis`
// in the output
null == _globalThis || null == (_ref = _flatMaybeArray(_globalThis)) ? void 0 : _includes(_ref2 = _ref.call(_globalThis)).call(_ref2, 1);