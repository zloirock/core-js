// a shared static-object wrapper: the FIRST prop's in-place literal rewrite leaves a
// polyfill stub (`b: _Promise`) that the SIBLING prop's walk must see through via the
// injector hint - without recovery the sibling bound off the stub (unbound at runtime
// where native requires the constructor receiver)
const w = { a: Array, b: Promise };
const { a: { from }, b: { resolve } } = w;
from([1]);
resolve(2);
