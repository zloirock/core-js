import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the pure sibling: here the root is SUBSTITUTED when the container-bound alias resolves, so both
// directions are observable. a container that carries the global resolves and chains; a container
// carrying something else, and a slot whose position a leading spread shifted, have no single
// definite global value and must stay native. distinct method per line.
const [arrayWrap] = [_globalThis];
const {
  k: objectWrap
} = {
  k: _globalThis
};
const [hop1] = [_globalThis];
const [hop2] = [hop1];
const [notGlobal] = [somethingElse];
const [shifted] = [...src, _globalThis];
export const r1 = _Array$from([1]);
export const r2 = _Symbol$iterator;
export const r3 = _Array$of(2);
export const r4 = notGlobal.Array.isArray([]);
export const r5 = shifted.Map;