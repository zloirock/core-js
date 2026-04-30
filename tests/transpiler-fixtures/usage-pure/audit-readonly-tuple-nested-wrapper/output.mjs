import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// nested `Readonly<>` wrappers around a tuple type: `Readonly<Readonly<[string[], number]>>`.
// each layer must peel transparently so the underlying tuple element shape survives,
// letting `xs.at(0)` reach the array-specific polyfill
type DoublyReadonly = Readonly<Readonly<[string[], number]>>;
declare const xs: DoublyReadonly[0];
_atMaybeArray(xs).call(xs, 0);