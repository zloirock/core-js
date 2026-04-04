import "core-js/modules/es.array.at";
import "core-js/modules/es.string.bold";
import "core-js/modules/es.string.fontcolor";
declare const tuple: [string, ...string[]];
tuple.at(0).bold();
tuple.at(1).fontcolor('red');