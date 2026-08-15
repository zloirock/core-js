import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
var _ref, _ref2;
// a replaced global returns whatever the patch returns, so the known narrow drops to the
// generic dispatch - the same trust gate the static-registry arms already apply
_globalThis.atob = (() => [1, 2]) as any;
_at(_ref = atob('x')).call(_ref, 0);
_toFixedMaybeNumber(_ref2 = parseFloat('1.5')).call(_ref2, 1);