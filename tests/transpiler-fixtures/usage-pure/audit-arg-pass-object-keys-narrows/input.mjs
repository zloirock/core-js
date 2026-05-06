// `Object.keys(o)` reads enumerable own keys, no mutation. classifier consults
// known-built-in-return-types.json: Object.keys has no `mutatesArgument` annotation,
// so the call is 'trivial' and the alias closure for `o` survives. property-init
// narrow `arr: [1,2,3]` is preserved on both `.at(0)` (Array narrow polyfill) and
// `.includes(0)` (Array narrow polyfill). without this gate, the call would leak
// the closure and force generic `_at` / `_includes`
const o = {
  arr: [1, 2, 3],
  test() {
    Object.keys(o);
    const a = this.arr.at(0);
    const b = this.arr.includes(0);
    return [a, b];
  }
};
o.test();
