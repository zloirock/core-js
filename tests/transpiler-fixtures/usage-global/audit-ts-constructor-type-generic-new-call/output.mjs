import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// TS generic constructor type used with `new`: the type position is type-only, but
// the runtime `new` call still resolves to the polyfilled constructor.
type Factory<T> = new () => T;
declare function make(): Factory<string>;
new (make())().at(-1);