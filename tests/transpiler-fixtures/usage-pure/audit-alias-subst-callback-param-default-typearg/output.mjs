import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// receiver alias instantiated without explicit type-arg falls back to the declared default.
// the callback param slot must pick up the substituted default (`T = number`), not the
// raw param symbol
type Holder<T = number> = {
  use(cb: (items: T[]) => void): void;
};
declare const h: Holder;
h.use(items => {
  _atMaybeArray(items).call(items, 0);
});