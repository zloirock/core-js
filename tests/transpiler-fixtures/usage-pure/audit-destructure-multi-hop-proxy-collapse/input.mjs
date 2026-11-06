// A realm navigation with two hops between the root and the constructor (`globalThis.self.window`)
// folds them all: the residual reads the constructor off the backed hop's ponyfill (`_self.Array`).
const { of, other } = globalThis.self.window.Array;
of(1, 2);
console.log(other);
