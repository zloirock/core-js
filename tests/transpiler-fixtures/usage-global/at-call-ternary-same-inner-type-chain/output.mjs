import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
(cond ? Object.keys(x) : Object.getOwnPropertyNames(x)).at(0).includes('y');