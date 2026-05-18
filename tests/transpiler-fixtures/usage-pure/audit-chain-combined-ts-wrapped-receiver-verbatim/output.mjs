import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// TS-wrapped chain receiver: `(globalThis as any).flat?.().includes(1)`. chain emit
// keeps the wrapper verbatim (`_ref = globalThis as any` - mirrors babel's memo shape).
// the inner `globalThis` Identifier visitor must be suppressed so it doesn't queue a
// parallel global-rewrite transform whose needle range (the whole `(globalThis as any)`
// Paren+TS-cast) wouldn't compose into the chain emit's wrapper-verbatim text
null == (_ref = globalThis as any) || null == (_ref2 = _flatMaybeArray(_ref)) ? void 0 : _includes(_ref3 = _ref2.call(_ref)).call(_ref3, 1);