import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A for-of head that ASSIGNS mirrors each claim into the iterated element. A computed key naming no
// known slot stops that mirror, so the static claim beside it keeps its own slot default - the one
// render the head has left, as on a head that declares. Both an object hop and a realm hop.
let from, of, other;
const key = pick();
for ({
  w: {
    [key]: other,
    from = _Array$from
  }
} of [{
  w: Array
}]) break;
for ({
  Array: {
    of = _Array$of,
    [key]: other
  }
} of [_globalThis]) break;
export { from, of, other };