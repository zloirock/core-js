import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Each effectful key runs on its own hop before the assignment yields its receiver.
const proxyKey = 'self',
  ctorKey = 'Promise';
let usedPrototype;
let hits = 0;
const keptEffects = (++hits, ++hits, {
  prototype: usedPrototype
} = _Promise, _globalThis);
use(keptEffects, usedPrototype, hits);