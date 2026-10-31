// A catch pattern has polyfills inside the iterator default and a later computed key.
// Both nested claims survive while key evaluation, iterator extraction, its default,
// and the later property read retain their original order.
try {} catch ({ [Symbol.iterator]: it = [9].flat(), [[1].at(0)]: b }) { b; it; }
