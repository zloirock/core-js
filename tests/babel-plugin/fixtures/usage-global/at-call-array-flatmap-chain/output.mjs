import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.unscopables.flat-map";
[1, 2].flatMap(x => [x, x + 1]).at(-1);