"use strict";

var _at = _interopRequireDefault(require("@core-js/pure/actual/array/instance/at"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _ref;
// late-CJS detection diagnostic: sibling plugin (`@babel/plugin-transform-modules-commonjs`)
// strips ESM markers AFTER our programExit. our programExit used to null `injector`
// immediately, so postHook bailed and the diagnostic warning never surfaced. fix defers
// cleanup to postHook so the markersGone + hasFlushed branch can fire and emit the
// user-facing warning about ESM/CJS mismatch
(0, _at.default)(_ref = [1, 2, 3]).call(_ref, 0);