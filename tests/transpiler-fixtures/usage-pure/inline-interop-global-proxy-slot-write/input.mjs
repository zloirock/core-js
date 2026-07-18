// the interop wrapper call used INLINE as the write receiver (no intermediate var): the
// `.default` member is still the global, so the write must taint like the var-bound form
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
_interopRequireDefault(require("@core-js/pure/actual/global-this")).default.Map = Shim;
new Map([[1, 2]]);
