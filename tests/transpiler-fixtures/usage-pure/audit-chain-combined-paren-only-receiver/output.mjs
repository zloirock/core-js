import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// Parenthesis-wrapped chain receiver `(globalThis).flat?.().includes(1)` - plain parens,
// no TS cast. The wrapper is peeled so the inner `globalThis` resolves to the global
// polyfill, and the optional chain narrows flat/includes without queuing a duplicate
// globalThis rewrite.
null == (_ref = _flatMaybeArray(_globalThis)) ? void 0 : _includes(_ref2 = _ref.call(_globalThis)).call(_ref2, 1);