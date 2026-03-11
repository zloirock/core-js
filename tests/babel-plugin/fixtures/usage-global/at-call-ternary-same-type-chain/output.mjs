import "core-js/modules/es.array.at";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.map";
(cond ? [1, 2].filter(x => x > 0) : [3, 4].map(x => x * 2)).at(-1);