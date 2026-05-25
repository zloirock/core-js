import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `declare const Map: any` - ambient TS value declaration; tsc elides it at runtime so it
// does NOT shadow the Map polyfill. complement to the runtime-shadow fixtures (enum,
// import = require, function-scope enum): adapter hasBinding must keep the ambient form
// falsy via the `parent.declare === true` gate in `isAmbientBindingShape` so the polyfill
// emission survives for the downstream type annotation
declare const Map: any;
let x: Map<string>;
export { x };