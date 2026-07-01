import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// An identity call/IIFE root (`(x => x)(globalThis)`) resolves to its argument, so a static-method
// destructure off it is recognized and polyfilled. Covers the bare-arg IIFE, an aliased identity
// function, and a nested call arg - all reach globalThis through the identity's param->arg passthrough.
((x) => x)(_globalThis).Array;
const from = _Array$from;
const wrap = x => x;
wrap(_globalThis).Array;
const of = _Array$of;
const getGlobal = () => _globalThis;
wrap(getGlobal()).Object;
const keys = _Object$keys;
from([1, 2]);
of(3, 4);
keys({ a: 1 });