import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.bold";
interface ArrayPromise extends Promise<string[]> {}
declare const p: ArrayPromise;
(await p).at(0).bold();