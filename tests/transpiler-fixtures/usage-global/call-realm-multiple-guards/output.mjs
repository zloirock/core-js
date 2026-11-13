import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.global-this";
// A call-returned realm keeps its environment probe while serving the static.
export const r = (() => globalThis)().window?.self?.Promise.race;