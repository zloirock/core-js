// `Array.from` is monkey-patched ('mutated static'). `this.from(arr)` inside a static
// method of `class C extends Array` resolves through inherited-static lookup and remaps to
// `Array.from`; only after the remap fixes the object to `Array` does the mutated-static
// check fire. so the call is left NATIVE - no polyfill - and the monkey-patch is respected.
Array.from = () => 'custom';
class C extends Array {
  static use(arr) {
    return this.from(arr);
  }
}
C.use([1, 2, 3]);