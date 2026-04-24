import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TS type-param with both a constraint and a default: `<T extends object = string[]>() => T`.
// when the call provides no inferable binding, the default (`string[]`) should drive the
// return type, not the much broader constraint (`object`). without the default the `.at(0)`
// call falls through to generic
declare function make<T extends object = string[]>(): T;
const xs = make();
_atMaybeArray(xs).call(xs, 0);