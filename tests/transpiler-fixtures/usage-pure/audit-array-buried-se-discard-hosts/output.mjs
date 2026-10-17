import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _unused2;
// An effect buried in an array wrapper's element runs once, in source order, whatever host the
// destructure stands in. A loop head hands the claim a literal in the slot; beside an object rest the
// wrapper is left consuming the element, the static written from its own entry and the rest copied
// off the realm after it - in a loop head and in an assignment alike.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let out1;
for (const [{
  Array: {
    from
  }
}] = [(eff('a'), {
  Array: {
    from: _Array$from
  }
})]; !out1;) out1 = from;
let out2;
for (const [,] = [(eff('b'), _globalThis)], of = (_globalThis.Array, _Array$of), {
    Array: _unused,
    ...rest2
  } = _globalThis; !out2;) out2 = of;
let fa;
let rest3;
[,] = [(eff('c'), _globalThis)];
_globalThis.Array, fa = _Array$fromAsync, {
  Array: _unused2,
  ...rest3
} = _globalThis;
export { out1, out2, fa, rest3, seen };