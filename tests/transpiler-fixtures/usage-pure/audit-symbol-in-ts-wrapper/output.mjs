import _isIterable from "@core-js/pure/actual/is-iterable";
// `(Symbol as any).iterator in obj` - TS `as` wrapper around `Symbol` is unwrapped
// before `in`-check recognition, so the `Symbol.iterator in obj` polyfill still fires.
_isIterable(obj);
// chained non-null: Symbol!.iterator
_isIterable(obj2);