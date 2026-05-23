// `Array.from` is monkey-patched ('mutated static'). `this.from(arr)` inside a static method of
// `class C extends Array` resolves through inherited-static lookup -> remap to `Array.from`.
// the pre-remap `isMutatedStaticMeta` gate sees `meta.object=null` (this-receiver, kind='property'
// but unresolved object) and lets the call through; the remap then sets `meta.object='Array'`
// matching the mutation set, but the gate doesn't re-fire. result: silent bypass of user's monkey-patch
Array.from = () => 'custom';
class C extends Array {
  static use(arr) { return this.from(arr); }
}
C.use([1, 2, 3]);
