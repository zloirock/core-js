import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.global-this";
// Source already imports the global `globalThis` polyfill side-effect module.
// `scanExistingCoreJSImports` should call `addGlobalImport` and dedup the import,
// so primary-pass globalThis usage detection doesn't re-emit the same module.

const w = globalThis;
const arr = [1, 2];
const last = arr.at(-1);
const tail = arr.findLast(x => x > 0);
export { w, last, tail };