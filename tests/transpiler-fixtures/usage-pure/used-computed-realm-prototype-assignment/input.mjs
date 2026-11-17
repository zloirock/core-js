// Computed keys do not change the value of a used pattern assignment.
const proxyKey = 'self', mapKey = 'Map';
let usedPrototype;
const keptComputed = ({ [proxyKey]: { [mapKey]: { prototype: usedPrototype } } } = globalThis);
use(keptComputed, usedPrototype);
