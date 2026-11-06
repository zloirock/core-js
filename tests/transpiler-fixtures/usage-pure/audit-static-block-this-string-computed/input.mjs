// `this['from']([1,2,3])` - string-literal computed key is semantically identical to
// `this.from([1,2,3])` at runtime. plugin resolves the string-literal key the same way
// as a regular identifier access and polyfills through Array.from
class C extends Array {
  static {
    this['from']([1, 2, 3]);
  }
}
