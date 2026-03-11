import "core-js/modules/es.array.at";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.join";
import "core-js/modules/es.string.at";
(cond ? [1, 2].join(',') : [3, 4].filter(x => x > 0)).at(-1);