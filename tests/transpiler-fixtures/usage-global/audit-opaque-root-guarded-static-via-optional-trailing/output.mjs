import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// optional spellings on the TRAILING dispatch keep their own guards over the collapsed static
const p = () => globalThis;
export const viaOptionalTrailing = p()?.window?.Promise.resolve(4)?.then?.(x => x);