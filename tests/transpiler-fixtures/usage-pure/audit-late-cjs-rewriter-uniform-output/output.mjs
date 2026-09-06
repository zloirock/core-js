"use strict";

var _at = _interopRequireDefault(require("@core-js/pure/actual/array/instance/at"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _ref;
// `@babel/plugin-transform-modules-commonjs` runs after the polyfill pass and rewrites OUR
// injected import along with the rest of the body, so the output is uniform CommonJS and
// nothing is owed - the late-CJS diagnostic asks about our own surviving nodes, and a rewrite
// that reached all of them leaves none.
(0, _at.default)(_ref = [1, 2, 3]).call(_ref, 0);