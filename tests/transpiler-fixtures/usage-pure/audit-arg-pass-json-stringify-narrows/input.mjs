// `JSON.stringify(o)` reads `o` for serialization without mutating it. classifier
// consults known-built-in-return-types.json: JSON.stringify has no `mutatesArgument`
// annotation, so the call site is treated as 'trivial' (no escape) and the alias
// closure stays intact. property-init narrow `arr: [1,2,3]` survives, `.at(0)` resolves
// to the array-narrow polyfill (`_atMaybeArray`). without this support, the call
// would leak the closure and force generic `_at`
const o = {
  arr: [1, 2, 3],
  test() {
    JSON.stringify(o);
    return this.arr.at(0);
  }
};
o.test();
