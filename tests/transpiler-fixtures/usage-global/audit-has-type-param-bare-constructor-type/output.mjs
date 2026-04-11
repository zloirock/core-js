import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
declare function make<T>(): new () => T;
const ctor = make<string>();
const val = new ctor();
val.at(-1);