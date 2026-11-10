// A constructor fallback keeps the read through the seal before its prototype.
let held;
use(((held = globalThis.window)?.self).Promise.prototype.finally);
