import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
import "core-js/modules/es.string.includes";
[Object.keys(x), Object.getOwnPropertyNames(x)].find(Boolean).at(0).includes('y');