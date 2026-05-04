// Awaited<T> distributes over unions inside Promise wrappers per TS spec:
// `Awaited<Promise<Promise<X> | Y>>` -> `Awaited<Promise<X> | Y>` -> `Awaited<X> | Awaited<Y>`.
// `resolveAwaitedAnnotation` handles distribution at the AST stage (before resolved-type
// fold collapses `Promise<X> | Y` to null). Both branches resolve to Array, so `v` narrows
// to Array<number | string> -> at(0) emits `_atMaybeArray`
async function deep() {
  type Inner = Promise<Promise<number[]> | string[]>;
  type Result = Awaited<Inner>;
  declare const v: Result;
  return v.at(0);
}
deep();
