import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
let sameScope = null;
sameScope = [1];
export const b = sameScope.flatMap(f);