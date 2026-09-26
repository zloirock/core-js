// `(Symbol as any).iterator in obj` - TS `as` wrapper around `Symbol` is unwrapped
// before `in`-check recognition, so the `Symbol.iterator in obj` polyfill still fires.
(Symbol as any).iterator in obj;
// chained non-null: Symbol!.iterator
Symbol!.iterator in obj2;
