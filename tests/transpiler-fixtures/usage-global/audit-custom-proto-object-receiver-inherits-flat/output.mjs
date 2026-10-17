import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
let stringKey = {
  "__proto__": Array.prototype
};
export const m = stringKey.flat();