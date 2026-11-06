import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _unused2;
// Effects inside an array element run once in for-init and assignment hosts.
// Captured static leaves beside rest are served; the simple wrapper keeps its native from read.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
let out1;
for (const [{
  Array: {
    from
  }
}] = [(eff('a'), _globalThis)]; !out1;) out1 = from;
let out2;
for (const [,] = [(eff('b'), _globalThis)], {} = _globalThis, of = (_globalThis.Array, _Array$of), {
    Array: _unused,
    ...rest2
  } = _globalThis; !out2;) out2 = of;
let fa;
let rest3;
[,] = [(eff('c'), _globalThis)], {} = _globalThis, _globalThis.Array, fa = _Array$fromAsync, {
  Array: _unused2,
  ...rest3
} = _globalThis;
export { out1, out2, fa, rest3, seen };