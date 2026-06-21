import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
// IIFE-returned proxy-global whose member does NOT resolve to a pure replacement: `.foo` is not a
// polyfillable static and `in (...).items` reads a plain member, so neither collapses the receiver.
// the IIFE stays in the output and its inner globalThis is a LIVE reference that must substitute to
// `_globalThis` - marking it subsumed would strand a raw global (ReferenceError without globalThis).
// contrast siblings where a real static collapse (`.Array.from`) DOES subsume the receiver.
const a = (() => _globalThis)().foo.bar;
const b = _isIterable((() => _globalThis)().items);
a;
b;