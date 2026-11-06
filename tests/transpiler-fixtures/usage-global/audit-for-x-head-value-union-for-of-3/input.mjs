// An OPAQUE iterable enumerates no value the resolver can name, so the rebound alias may hold ANYTHING at the use - including a
// string, whose instance method needs the polyfill off target.
let V = Object;
for (V of gen()) { break; }
