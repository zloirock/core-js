import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// combined optional chain whose receiver is an IIFE-returned proxy-global behind a TS cast
// (`((() => globalThis)() as any).flat?.().at(0)`). the inner globalThis substitutes to
// `_globalThis` (the IIFE stays a live reference - the cast member does not collapse it) and the
// cast wrapper is preserved verbatim in the memo, matching the single-call receiver resolution
const r = null == (_ref2 = _flatMaybeArray(_ref = (() => _globalThis)() as any)) ? void 0 : _at(_ref3 = _ref2.call(_ref)).call(_ref3, 0);
r;