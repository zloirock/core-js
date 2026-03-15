import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
(cond ? Object.keys(x) : [1, 2, 3]).at(0).includes('y');