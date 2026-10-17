// a call root FORWARDING the real global through an object literal: the shorthand binding IS
// the global constructor (the container walk descends the returned literal like a const-bound
// one), so the claim resolves and the polyfill lands; the user-object negative above stays raw,
// and a conditionally assigned forwarder keeps its optional call as the guard
const forwards = () => ({ window: { Array } });
export const literalForwardedRoot = forwards()?.window?.Array.of(13);
