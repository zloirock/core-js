import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// the other slot babel hangs off the function node: a member DECORATOR. it runs where the class is
// defined, so the decorated method's own hoisted `var` is not its shadow either - the same rule the
// computed key gets, asked of the other slot. the last member keeps the negative: a `var` around
// the class does cover the decorator, because the decorator really does sit in that scope.
const dec = () => c => c;
class C {
  @dec(_Promise$resolve(1))
  m() {
    var Promise = 1;
    return Promise;
  }
  @dec(_Promise$resolve(2))
  #p() {
    {
      var Promise = 2;
    }
  }
  run() {
    return this.#p();
  }
}
function outerShadow() {
  var Promise = 3;
  class D {
    @dec(Promise.resolve(4))
    m() {}
  }
  return D;
}
export { C, outerShadow };