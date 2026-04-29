"use strict";

var _at = _interopRequireDefault(require("@core-js/pure/actual/array/instance/at"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _ref;
// when `@babel/plugin-transform-modules-commonjs` strips ESM markers after the polyfill
// pass, the late-CJS warning must still be surfaced.
(0, _at.default)(_ref = [1, 2, 3]).call(_ref, 0);