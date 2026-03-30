"use strict";

var _WeakMap = require("@core-js/pure/actual/weak-map/constructor");
var _Object$defineProperty = require("@core-js/pure/actual/object/define-property");
var _Object$getOwnPropertyDescriptor = require("@core-js/pure/actual/object/get-own-property-descriptor");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.x = void 0;
var ns = _interopRequireWildcard(require("foo"));
function _interopRequireWildcard(e, t) { if ("function" == typeof _WeakMap) var r = new _WeakMap(), n = new _WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = _Object$defineProperty) && _Object$getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const x = exports.x = ns;