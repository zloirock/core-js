import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// a super-class alias chain (`class C extends Mid`, `const Mid = Base`) resolves each hop in the
// hop's OWN declaration scope. the `extends` clause has its own resolver, so extending the aliased
// Promise pulls the constructor family, and an inner shadow of an INTERMEDIATE name (`Base`) at the
// class site does not reach it: the family is here either way. the inherited `super.race` rides
// inside that same family, so the static dispatch adds no import of its own - what this locks is the
// family surviving the shadow
const Base = globalThis.Promise;
const Mid = Base;
function makeClass() {
  const Base = userLibrary;
  return class Derived extends Mid {
    static build() {
      return super.race([]);
    }
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
    static build() {
      return super.allSettled([]);
    }
  };
}
export { makeMemberClass };