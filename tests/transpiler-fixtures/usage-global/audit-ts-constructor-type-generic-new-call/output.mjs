import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type Factory<T> = new () => T;
declare function make(): Factory<string>;
new (make())().at(-1);