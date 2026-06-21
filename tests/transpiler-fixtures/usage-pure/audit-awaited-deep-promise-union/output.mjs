import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Awaited<T> distributes over unions inside Promise wrappers per TS spec:
// `Awaited<Promise<Promise<X> | Y>>` -> `Awaited<Promise<X> | Y>` -> `Awaited<X> | Awaited<Y>`.
// distribution must be handled at the AST stage (before the resolved-type fold collapses
// `Promise<X> | Y` to null). both branches resolve to Array, so `v` narrows to
// Array<number | string> and at(0) emits `_atMaybeArray`
async function deep() {
  type Inner = Promise<Promise<number[]> | string[]>;
  type Result = Awaited<Inner>;
  declare const v: Result;
  return _atMaybeArray(v).call(v, 0);
}
deep();