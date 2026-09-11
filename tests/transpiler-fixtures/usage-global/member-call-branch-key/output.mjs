import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
const arr = [3, [1, 2]];
arr[cond ? "flat" : "at"]();