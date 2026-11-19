import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A plain read above a nullable realm selection keeps its throw.
// The defined arm still supplies the static method.
export const result = (globalThis.window == null ? void 0 : globalThis).self.Promise.resolve;