import "core-js/modules/es.string.at";
// TS generic constructor type used with `new`: `make()` yields `Factory<string>` (= `new () => string`),
// so `new (make())()` resolves to the instance type `string` and only String.prototype.at is injected
// (the constructor-type alias is followed through to its substituted return).
type Factory<T> = new () => T;
declare function make(): Factory<string>;
new (make())().at(-1);