"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flat = void 0;
var _flat = _interopRequireDefault(require("@core-js/pure/actual/array/instance/flat"));
var _data = require("./data");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// `transform-modules-commonjs` runs after our plugin and rewrites `export` → CJS. polyfill
// for `.flat()` must remain working: the plugin emits ESM-style `import _flatMaybeArray
// from "..."` which the sibling rewrites to `var _flatMaybeArray = require("...")`. inner
// instance-call output `_flatMaybeArray(_ref).call(_ref)` survives unchanged

const flat = exports.flat = (0, _flat.default)(_data.items).call(_data.items);