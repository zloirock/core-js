// Each effectful key runs on its own hop before the assignment yields its receiver.
const proxyKey = 'self', ctorKey = 'Promise';
let usedPrototype;
let hits = 0;
const keptEffects = ({ [(++hits, proxyKey)]: { [(++hits, ctorKey)]: { prototype: usedPrototype } } } = globalThis);
use(keptEffects, usedPrototype, hits);
