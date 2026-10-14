import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// A realm navigation whose hop is a computed string key (`globalThis['self']`) folds like its dotted
// twin: the residual reads the constructor off the backed hop's ponyfill (`_self.Array`), never off a
// raw `self` read of the realm, which is undefined where the engine has no `self`.
const of = _Array$of;
const {
  other
} = _self.Array;
of(1, 2);
console.log(other);