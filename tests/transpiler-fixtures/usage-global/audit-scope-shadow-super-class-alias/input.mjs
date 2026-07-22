// a super-class alias chain (`class C extends Mid`, `const Mid = Base`) resolves each hop in the
// hop's OWN declaration scope. the `extends` clause has its own resolver, so extending the aliased
// Promise pulls the constructor family whether or not the hop-scope rule fires; the rule gates the
// inherited-STATIC dispatch instead - `super.race` walks the super-class alias, so an inner shadow of
// an INTERMEDIATE name (`Base`) at the class site captures that hop and drops the `super.race` ->
// Promise.race static, while the extends-driven constructor family stays either way
const Base = globalThis.Promise;
const Mid = Base;
function makeClass() {
  const Base = userLibrary;
  return class Derived extends Mid {
    static build() { return super.race([]); }
  };
}
export { makeClass };
// the same hop rule holds when the super-class is a MEMBER off a container alias (`extends
// Container.Promise`): the container hop resolves in the alias's declaration scope, so an inner
// shadow of the container name drops the inherited `super.allSettled` -> Promise.allSettled static -
// again only the inherited static rides on the hop, the extends-driven constructor family does not
const RealContainer = globalThis;
const Container = RealContainer;
function makeMemberClass() {
  const RealContainer = userObj;
  return class MemberDerived extends Container.Promise {
    static build() { return super.allSettled([]); }
  };
}
export { makeMemberClass };
