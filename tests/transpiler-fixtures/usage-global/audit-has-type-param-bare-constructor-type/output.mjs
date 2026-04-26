import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// TS bare constructor type `new () => T` as a type-only reference: must not trigger
// runtime polyfill emission.
declare function make<T>(): new () => T;
const ctor = make<string>();
const val = new ctor();
val.at(-1);