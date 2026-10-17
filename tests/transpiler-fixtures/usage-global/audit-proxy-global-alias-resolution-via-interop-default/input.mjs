// a `.default` hop off a CJS-interop-wrapped global-proxy require re-enters the global surface
// mid-chain, exactly like the top-level interop read
function _interopRequireDefault(m) { return m && m.__esModule ? m : { default: m }; }
var X = _interopRequireDefault(require("@core-js/pure/actual/global-this"));
export const viaInteropDefault = X.default.Promise.try(() => 1);
