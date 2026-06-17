// `Array.from` is monkey-patched ('mutated static'). `this.from(arr)` inside a static method of
// `class C extends Array` resolves through inherited-static lookup -> remap to `Array.from`. the
// pre-remap meta has `object=null` (this-receiver, unresolved object), but after the remap sets
// `object='Array'` the mutated-static check fires and matches the mutation set, so the call is left
// NATIVE - no polyfill imported - and the user's monkey-patch is respected (NOT bypassed). empty
// rewrite is correct: a mutated static must not be overridden by the polyfill
Array.from = () => 'custom';
class C extends Array {
  static use(arr) {
    return this.from(arr);
  }
}
C.use([1, 2, 3]);