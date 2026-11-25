// a user monkey-patch applied THROUGH an imported global-proxy entry taints the slot exactly as one
// through a plain `globalThis` alias does: the import binds the global object itself, so the write
// lands on the real namespace. without that recognition the pure flavor substitutes its ponyfill
// over the patch - reads resolved through the binding while writes through the SAME binding did
// not taint. the static therefore stays raw: the user's replacement is what must run.
// The ESM default, CommonJS export and Babel interop default all identify the same global.
// Each subsequent read must observe the replacement made through that spelling.
import proxy from "core-js/actual/global-this";
proxy.Object.create = replacement;
export const a = Object.create(null);
var required = require("core-js/actual/global-this");
required.Object.entries = replacement;
export const b = Object.entries(source);
var wrapped = _interopRequireDefault(require("core-js/actual/global-this"));
wrapped.default.Object.keys = replacement;
export const c = Object.keys(source);
