import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `typeof X` in an annotation position references the runtime binding `X`. in usage-global,
// the runtime reference must still trigger the constructor polyfill so the declaration is
// valid even if `X` is only named through the annotation (no bare runtime read elsewhere)
let mapType: typeof Map;
mapType = null;