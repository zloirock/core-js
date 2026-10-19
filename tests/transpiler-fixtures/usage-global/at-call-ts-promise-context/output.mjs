import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// @ts-expect-error the member read is the probe, and the right answer is a type without it
(x as Promise<any>).at(-1);