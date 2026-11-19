// The prefix runs before the constructor fallback tests a realm alias or a bare probe.
// A missing binding still throws there. The computed constructor key belongs to the live arm.
const realm = globalThis.window;
export const aliased = (first(), realm)?.self.WeakMap.mode;
export const bare = typeof (second(), window)?.self.Iterator.api;
export const keyed = (missing, third(), globalThis.window)?.self[(key(), 'Map')].label;
export const nested = (first(), missing, second(), realm?.self)?.WeakMap.mode;
