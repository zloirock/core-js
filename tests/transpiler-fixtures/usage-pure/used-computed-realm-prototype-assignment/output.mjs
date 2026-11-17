import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// Computed keys do not change the value of a used pattern assignment.
const proxyKey = 'self',
  mapKey = 'Map';
let usedPrototype;
const keptComputed = ({
  prototype: usedPrototype
} = _Map, _globalThis);
use(keptComputed, usedPrototype);