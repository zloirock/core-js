// `super.at(0)` from a static method reads `Array.at` on the super CONSTRUCTOR - but `at` is
// instance-only (Array#at, no Array.at static), so injecting the instance polyfill (es.array.at) would
// not create the missing static and is pure over-injection. the synthetic inherited-static meta resolves
// to an instance desc, so usage-global SKIPS it (matching usage-pure) - the output carries NO import
class X extends Array {
  static m() {
    return super.at(0);
  }
}