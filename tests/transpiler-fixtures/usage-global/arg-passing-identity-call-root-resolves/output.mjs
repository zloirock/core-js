import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// An identity call/IIFE root (`(x => x)(globalThis)`) resolves to its argument, so a static-method
// destructure off it is recognized and the polyfill for that method is injected (global mode).
const {
  from
} = (x => x)(globalThis).Array;
const wrap = x => x;
const {
  of
} = wrap(globalThis).Array;
from([1, 2]);
of(3, 4);