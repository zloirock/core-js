import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// arrow expression body variant: nested arrow whose expression body emits a polyfill
// requiring `_ref` (optional-chain safe-call cache). the arrow body wrap (`{ var _ref;
// return EXPR; }`) is anchored at the original-source body span, which sits AFTER a
// `globalThis -> _globalThis` substitution. wrap and substitution splices must apply
// in one descending-order pass to keep both anchors valid against the unmutated source
const from = _Array$from;
const val = (function () {
  const x = _globalThis;
  return (() => { var _ref; return null == (_ref = _flatMaybeArray(arr)) ? void 0 : _at(_ref()); })();
})();
console.log(from, val);