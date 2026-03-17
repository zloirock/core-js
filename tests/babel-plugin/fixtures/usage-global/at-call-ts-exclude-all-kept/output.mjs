import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type T = Exclude<string | number, boolean>;
declare const x: T;
x.at(0);