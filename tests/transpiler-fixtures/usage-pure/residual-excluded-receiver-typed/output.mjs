import _globalThis from "@core-js/pure/actual/global-this";
// A transparent type assertion leaves the excluded receiver's guard and prefix intact.
// The native residual read remains on the selected realm slot.
const {
  missing = fallback()
} = (record(), (null == _globalThis.window ? void 0 : _globalThis.self).Map);
use(missing);