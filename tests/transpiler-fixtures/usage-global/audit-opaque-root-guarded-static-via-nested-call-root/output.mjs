import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// a NESTED provable wrapper (`f` returns `g()` which returns the global) proves through the
// same inline canon, layer by layer
const ng = () => globalThis;
const nf = () => ng();
export const viaNestedCallRoot = nf()?.window?.self?.Array.of(21).at(0);