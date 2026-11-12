import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
// Dynamic import phases survive a printing transform independently of static imports.
export const read = () => import.defer("printer-lazy").then(ns => ns.read([7].at(0)));
export const source = () => import.source("printer.wasm");