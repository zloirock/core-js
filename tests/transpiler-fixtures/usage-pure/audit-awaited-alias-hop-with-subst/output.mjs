import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Awaited<Wrapped<T>> where Wrapped<U> = Promise<U[]>. the Awaited unwrap
// follows alias chain, accumulates subst {U->T}, applies it to body Promise<U[]>
// -> Promise<T[]>, recurses to peel Promise wrapper and substitute element.
// Caller passes `T = number`, so final shape should be `number[]` -> Array narrows.
type Wrapped<U> = Promise<U[]>;
async function fn() {
  declare const v: Awaited<Wrapped<number>>;
  _atMaybeArray(v).call(v, 0);
  _findLastMaybeArray(v).call(v, x => true);
}
fn();