import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.unscopables.flat-map";
[1, 2].flatMap(x => [x, x + 1]).includes(3);