import _globalThis from "@core-js/pure/actual/global-this";
import _String$fromCodePoint from "@core-js/pure/actual/string/from-code-point";
import _endsWithMaybeString from "@core-js/pure/actual/string/instance/ends-with";
var _ref;
// NEGATIVE: no memo is needed in the body, so no scoped var is inserted and neither path runs
export const noScopedVar = null == (() => _globalThis)()?.window ? void 0 : _endsWithMaybeString(_ref = _String$fromCodePoint(99)).call(_ref, 'c');