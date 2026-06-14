// IIFE-returned proxy-global whose member does NOT resolve to a pure replacement: `.foo` is not a
// polyfillable static and `in (...).items` reads a plain member, so neither collapses the receiver.
// the IIFE therefore stays in the output and its inner globalThis is a LIVE reference that must
// substitute to `_globalThis` - treating it as a subsumed receiver (marking it handled) would
// strand a raw global (ReferenceError on engines lacking globalThis). contrast the sibling
// `(() => globalThis)().Array.from` fixtures where a real static collapse DOES subsume the receiver
const a = (() => globalThis)().foo.bar;
const b = Symbol.iterator in (() => globalThis)().items;
a;
b;
