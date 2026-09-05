import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a BOUND branch name is the value canon's question, not a bail: a const alias of a global resolves to
// it and mirrors per branch like the bare name, so the pattern never reads the static off the swapped
// constructor (which carries none); a parameter shadowing the name resolves to no global and its
// branch stays raw
const P = _Promise;
const {
  all: viaAlias
} = cond ? {
  all: _Promise$all
} : Fallback;
const A = Array;
const viaLogical = _Array$from;
function shadowed(Array) {
  const {
    from
  } = cond ? Array : {
    from: _Iterator$from
  };
  return from;
}
export { viaAlias, viaLogical, shadowed };