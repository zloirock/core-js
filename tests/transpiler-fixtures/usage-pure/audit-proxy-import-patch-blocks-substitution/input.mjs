// a user monkey-patch applied THROUGH an imported global-proxy entry taints the slot exactly as one
// through a plain `globalThis` alias does: the import binds the global object itself, so the write
// lands on the real namespace. without that recognition the pure flavor substitutes its ponyfill
// over the patch - reads resolved through the binding while writes through the SAME binding did
// not taint. the static therefore stays raw: the user's replacement is what must run.
// the ESM import is the shape the proxy-root walk recognises. the two lowered shapes below - the
// CJS require whose `module.exports` IS the global, and the interop wrapper whose `.default` is -
// are NOT yet recognised on the write side, so their patches are still shadowed: the substitution
// in their rows is the KNOWN GAP, kept visible here rather than left undocumented. widening the
// shared proxy-root walk to cover them is not the fix - the read side uses the same walk, and a
// disable-directive leaf then reads the ponyfill's namespace instead of the native one
import proxy from "core-js/actual/global-this";
proxy.Object.create = replacement;
export const a = Object.create(null);
var required = require("core-js/actual/global-this");
required.Object.entries = replacement;
export const b = Object.entries(source);
var wrapped = _interopRequireDefault(require("core-js/actual/global-this"));
wrapped.default.Object.keys = replacement;
export const c = Object.keys(source);
