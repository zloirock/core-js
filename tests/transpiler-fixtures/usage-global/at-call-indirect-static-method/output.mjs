import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
const keys = Object.keys;
keys({
  a: 1,
  b: 2
}).at(-1);