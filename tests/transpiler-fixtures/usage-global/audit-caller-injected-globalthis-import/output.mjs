import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.global-this";
// Source already imports the `es.global-this` polyfill module: when usage detection
// finds `globalThis`, the existing import is deduped (one polyfill import in output).

const w = globalThis;
const arr = [1, 2];
const last = arr.at(-1);
const tail = arr.findLast(x => x > 0);
export { w, last, tail };