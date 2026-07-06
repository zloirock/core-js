// a `[Symbol.iterator]` leaf under a single-ctor-key ANCHOR extracts through the iterator-
// method helper off the anchored CONSTRUCTOR (the pure ctor binding when one exists, else a
// member read off the proxy binding), exactly like its proxy-outer twin: a sole binding
// drops the declarator, a static sibling extracts alongside in source order, an inner rest
// keeps the re-keyed sentinel in the residual anchored on the same base
const { Array: { [Symbol.iterator]: a } } = globalThis;
a;
const { Map: { [Symbol.iterator]: m } } = globalThis;
m;
const { Object: { [Symbol.iterator]: o, fromEntries: fe } } = globalThis;
o;
fe(x);
const { Set: { [Symbol.iterator]: s, ...ri } } = globalThis;
s;
ri;
