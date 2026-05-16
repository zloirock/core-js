// `(self?.foo).flat?.(0);` - parity check with paren-wrapped `globalThis` chain shape but
// with a different POSSIBLE_GLOBAL_OBJECTS leaf (`self`). asserts the top-level peel
// applies uniformly across the proxy-global set (globalThis / self / window / global) -
// not gated on a specific leaf name.
(self?.foo).flat?.(0);
