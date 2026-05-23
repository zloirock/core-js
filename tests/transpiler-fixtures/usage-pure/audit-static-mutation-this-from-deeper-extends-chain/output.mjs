// `this.from` in static method of grandchild class `class D extends C extends Array`.
// inherited-static lookup walks the extends chain to find `Array.from`. companion to the
// direct-extends fixture - verifies the post-remap mutation re-check stays correct when
// the static is inherited through multiple hops, not just one
Array.from = () => 'custom';
class C extends Array {}
class D extends C {
  static use(arr) {
    return this.from(arr);
  }
}
D.use([1, 2, 3]);