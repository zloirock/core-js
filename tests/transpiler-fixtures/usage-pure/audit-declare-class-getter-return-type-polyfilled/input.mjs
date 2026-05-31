// an ambient (declare / abstract) getter's property access yields its declared return type, so
// `this.data.at()` on an array-returning getter keeps the array polyfill instead of being suppressed
// as a Function-typed member.
abstract class B {
  abstract get data(): number[];
  read() { return this.data.at(0); }
}
