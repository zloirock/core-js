// Awaited<Wrapped<T>> where Wrapped<U> = Promise<U[]>. resolveAwaitedAnnotation
// follows alias chain, accumulates subst {U->T}, applies it to body Promise<U[]>
// -> Promise<T[]>, recurses to peel Promise wrapper and substitute element.
// Caller passes `T = number`, so final shape should be `number[]` -> Array narrows.
type Wrapped<U> = Promise<U[]>;
async function fn() {
  declare const v: Awaited<Wrapped<number>>;
  v.at(0);
  v.findLast(x => true);
}
fn();
