import _Array$from from "@core-js/pure/actual/array/from";
// a `||` whose LEFT operand is itself a diverging ternary carrying a global proxy. the left is
// kept (it holds the reachable proxy), its proxy branch mirrored to a synth literal binding the
// polyfill, its user-object branch verbatim - the proxy path uses the polyfill, the user path stays
// native. both arms are objects, so the `||` fallback is dead and drops. guards the recursion: a
// logical/ternary left is not a bare-identifier primary, so it is not skipped for the right fallback
const userObj = {
  Array: {
    from: () => "U"
  }
};
const fallback = {
  Array: {
    from: () => "F"
  }
};
let pick = true;
const {
  Array: {
    from
  }
} = pick ? {
  Array: {
    from: _Array$from
  }
} : userObj;
from([1]);