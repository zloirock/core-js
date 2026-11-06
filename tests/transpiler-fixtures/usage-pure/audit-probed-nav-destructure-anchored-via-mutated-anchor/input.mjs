// A mutated constructor retains its raw slot through the guard: the user's replacement
// stays visible at a present probe, and the destructure still throws at an absent one.
globalThis.Map = function PatchedMap() {};
export const { Map: { customY: viaMutatedAnchor } } = (globalThis.window?.self);
