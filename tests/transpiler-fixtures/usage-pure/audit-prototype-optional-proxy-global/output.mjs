import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// `globalThis?.Array.prototype.at(0)` — optional proxy-global + prototype-access.
// after babel mutation `globalThis → _globalThis`, buildMemberMeta's prototype-detection
// still recognizes Array through polyfillHint on the `_globalThis` import binding
_atMaybeArray(_ref = _globalThis.Array.prototype).call(_ref, 0);