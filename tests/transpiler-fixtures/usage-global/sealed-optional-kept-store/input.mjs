// A write inside the seal keeps its value, and the plain reader still throws.
let held;
use(((held = globalThis.window)?.self).self?.Promise.resolve);
