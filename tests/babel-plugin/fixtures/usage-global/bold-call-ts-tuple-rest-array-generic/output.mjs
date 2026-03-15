import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.bold";
declare const tuple: [number, ...Array<string>];
tuple.at(0).toFixed(2);
tuple.at(1).bold();