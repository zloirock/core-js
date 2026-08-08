import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref;
// a `||` / `??` RIGHT-operand global proxy buried in a ternary branch: the proxy operand is
// synth-swapped per branch (polyfill fires only when the runtime actually yields the global),
// while caller-provided objects on the other paths keep their own methods
let c = Math.random() < 0.5;
let m = null;
let x = { Array: { from: v => v } };
const { Array: { from } } = c ? (m || { Array: { from: _Array$from } }) : x;
export const viaOrRight = from([1, 2]);

// `??` right fallback in the ternary ALTERNATE synth-swaps the same way
let d = Math.random() < 0.5;
let k = null;
let y = { Object: { groupBy: v => v } };
const { Object: { groupBy } } = d ? y : (k ?? { Object: { groupBy: _Object$groupBy } });
export const viaNullishRight = groupBy([1, 2], v => v % 2);

// both operands non-proxy: nothing to substitute, the destructure stays native
let e = Math.random() < 0.5;
let p = null;
let q = { Promise: { allSettled: v => v } };
let z = { Promise: { allSettled: v => v } };
const { Promise: { allSettled } } = e ? (p || q) : z;
export const viaNonProxy = allSettled([]);

// NESTED logicals recurse: the innermost right-operand proxy is the one synth-swapped
let f2 = Math.random() < 0.5;
let m2 = null, k2 = null;
let x2 = { Iterator: { from: v => v } };
const { Iterator: { from: iterFrom } } = f2 ? (m2 || (k2 ?? { Iterator: { from: _Iterator$from } })) : x2;
export const viaNestedRight = iterFrom(_valuesMaybeArray(_ref = [1, 2]).call(_ref));

// a side-effecting LEFT operand survives the swap verbatim - the effect still runs on the
// taken branch, and a truthy result keeps its own methods
let g2 = Math.random() < 0.5;
let eff = () => null;
let x3 = { Map: { groupBy: v => v } };
const { Map: { groupBy: mapGroupBy } } = g2 ? (eff() || { Map: { groupBy: _Map$groupBy } }) : x3;
export const viaSeLeft = mapGroupBy([1, 2], v => v % 2);