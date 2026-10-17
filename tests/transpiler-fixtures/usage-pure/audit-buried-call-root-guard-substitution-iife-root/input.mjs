// An inline-call chain root BURIES the proxy-global (an IIFE body, an identity argument), and the only hop is one core-js does not
// ponyfill, so nothing collapses and the guard test keeps the root text.
export const iifeRoot = (() => globalThis)()?.window?.Array.of(5).at(0);
