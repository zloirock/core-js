import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the global-mode twin of the same question: a binding names the realm by the VALUE it holds, so a
// call-captured root, an identity-call one, a chain-assign store and a literal slot all inject what
// the bare alias injects. the copy that walked the init itself resolved neither call spelling, and
// this mode - where nothing is rewritten - simply under-injected. one method per line: the import set
// is the only observable, so two lines sharing a method would mask each other
function makeRealm() {
  return globalThis;
}
const viaCall = makeRealm();
export const fromCall = viaCall.Map.groupBy([1], x => x);
function identity(value) {
  return value;
}
const viaIdentity = identity(globalThis);
export const fromIdentity = viaIdentity.Object.hasOwn({}, 'k');
let held;
const viaChainAssign = held = globalThis;
export const fromChainAssign = viaChainAssign.Array.fromAsync([2]);
const [viaSlot] = [globalThis];
export const fromSlot = viaSlot.Promise.try(() => 1);