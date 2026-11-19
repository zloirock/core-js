// A transparent type assertion leaves the excluded receiver's guard and prefix intact.
// The native residual read remains on the selected realm slot.
const { Map: { missing = fallback() } } = (record(), (globalThis.window as any)?.self);
use(missing);
