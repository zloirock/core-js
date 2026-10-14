import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// A realm navigation with two hops between the root and the constructor (`globalThis.self.window`)
// folds them all: the residual reads the constructor off the backed hop's ponyfill (`_self.Array`).
const of = _Array$of;
const {
  other
} = _self.Array;
of(1, 2);
console.log(other);