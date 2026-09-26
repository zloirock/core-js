// An identity call/IIFE root (`(x => x)(globalThis)`) resolves to its argument, so a static-method
// destructure off it is recognized and polyfilled. Covers the bare-arg IIFE, an aliased identity
// function, and a nested call arg - all reach globalThis through the identity's param->arg passthrough.
const { from } = ((x) => x)(globalThis).Array;
const wrap = x => x;
const { of } = wrap(globalThis).Array;
const getGlobal = () => globalThis;
const { keys } = wrap(getGlobal()).Object;
from([1, 2]);
of(3, 4);
keys({ a: 1 });
