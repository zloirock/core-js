import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
declare function get(): [number, ...string];
get().at(0).toFixed(2);