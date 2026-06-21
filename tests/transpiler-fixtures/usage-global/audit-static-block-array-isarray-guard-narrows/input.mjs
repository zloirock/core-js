// static-block sibling early-exit guard: `Array.isArray` negation throws before usage.
// the StaticBlock body must be walked as a statement container so the guard registers;
// without it `arr.at` falls back to a generic polyfill including a spurious `es.string.at`.
class C {
  static {
    const arr: number[] | string = Math.random() < 0.5 ? [1, 2, 3] : "oops";
    if (!Array.isArray(arr)) throw new TypeError("not array");
    arr.at(0);
  }
}