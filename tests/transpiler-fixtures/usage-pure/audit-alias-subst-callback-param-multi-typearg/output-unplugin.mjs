import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// receiver alias has two type-args; each callback parameter slot must narrow
// independently through the deep subst (`T -> number[]`, `U -> string[]`)
type Holder<T, U> = { use(cb: (a: T[], b: U[]) => void): void };
declare const h: Holder<number, string>;
h.use((a, b) => { _atMaybeArray(a).call(a, 0); _findLastMaybeArray(b).call(b, Boolean); });