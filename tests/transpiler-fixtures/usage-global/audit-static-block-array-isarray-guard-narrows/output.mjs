import "core-js/modules/es.array.at";
// static-block sibling early-exit guard: `Array.isArray` negation throws before usage.
// `getStatementSiblings` (typeof-guards.js) walks the static-block body as a statement
// container; without StaticBlock support the guard never registers and `arr.at` falls back
// to a generic polyfill including `es.string.at` (extra unused import)
class C {
  static {
    const arr: number[] | string = Math.random() < 0.5 ? [1, 2, 3] : "oops";
    if (!Array.isArray(arr)) throw new TypeError("not array");
    arr.at(0);
  }
}