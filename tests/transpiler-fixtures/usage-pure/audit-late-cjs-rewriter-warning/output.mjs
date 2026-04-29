"use strict";

var _at = _interopRequireDefault(require("@core-js/pure/actual/array/instance/at"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _ref;
// late-CJS detection diagnostic: sibling plugin (`@babel/plugin-transform-modules-commonjs`)
// strips ESM markers after the polyfill provider's main pass finishes. Per-file injector
// cleanup is deferred so the late-CJS detector still has access to its state and can emit
// the user-facing diagnostic about ESM/CJS mismatch
(0, _at.default)(_ref = [1, 2, 3]).call(_ref, 0);