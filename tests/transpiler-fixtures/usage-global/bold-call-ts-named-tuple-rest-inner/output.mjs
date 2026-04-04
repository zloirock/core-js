import "core-js/modules/es.array.at";
import "core-js/modules/es.string.bold";
import "core-js/modules/es.string.strike";
declare const tuple: [first: string, ...rest: string[]];
tuple.at(0).bold();
tuple.at(1).strike();