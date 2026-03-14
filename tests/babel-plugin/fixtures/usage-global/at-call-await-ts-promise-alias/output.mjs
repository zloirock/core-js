import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.at";
declare function getItems(): Promise<string[]>;
const p: Promise<string[]> = getItems();
const a = p;
(await a).at(-1);