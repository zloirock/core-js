import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// combined optional chain whose receiver is a sequence with a proxy-global tail
// (`(0, globalThis).flat?.().at(0)`). the receiver resolves through the shared single-call
// resolver, so the SE-tail proxy-global substitutes to `_globalThis` (the prefix stays ahead
// of it in eval order) instead of surviving raw into every guard slot of the combined emit
const r = null == (_ref2 = _flatMaybeArray(_ref = (0, _globalThis))) ? void 0 : _at(_ref3 = _ref2.call(_ref)).call(_ref3, 0);
r;