// A rewritten catch pattern retains polyfills inside its computed keys.
// The iterator key is read before the later instance call and property read.
try {} catch ({ [Symbol.iterator]: it, [[1].at(0)]: b }) { it(); b; }
