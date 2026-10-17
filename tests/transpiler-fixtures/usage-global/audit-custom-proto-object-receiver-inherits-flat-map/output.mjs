import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
let written = {};
written.__proto__ = Array.prototype;
export const b = written.flatMap(f);