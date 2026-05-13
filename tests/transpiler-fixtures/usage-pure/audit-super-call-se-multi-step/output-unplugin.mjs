import _Array$from from "@core-js/pure/actual/array/from";
// super-call computed key with multi-step SE: every leading expression of the SE prefix
// must round-trip into the wrap (`(SE_a, SE_b, binding.call(...))`). Combined with an
// unterminated predecessor to exercise asiGuardLeadingParen alongside multi-SE collection.
class C extends Array {
  static run() {
    var x = 1
    ;(console.log('SE-a'), console.log('SE-b'), _Array$from.call(this, [1, 2]));
    return x;
  }
}
export { C };