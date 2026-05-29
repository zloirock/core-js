import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// qualified `typeof X.Y` references the runtime root X. unplugin's scope tracker skips the
// TSTypeQuery chain root, so the shared annotation walker extracts the root from the
// TSQualifiedName and both pipelines pull in the root global's polyfills. distinct roots
// (Map / Promise) keep each line's import set identifiable
let a: typeof Map.prototype;
let b: typeof Promise.resolve;