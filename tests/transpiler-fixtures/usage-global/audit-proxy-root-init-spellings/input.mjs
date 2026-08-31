// the global-mode twin of the same question: a binding names the realm by the VALUE it holds, so a
// call-captured root, an identity-call one, a chain-assign store and a literal slot all inject what
// the bare alias injects. the copy that walked the init itself resolved neither call spelling, and
// this mode - where nothing is rewritten - simply under-injected. one method per line: the import set
// is the only observable, so two lines sharing a method would mask each other
function makeRealm() { return globalThis; }
const viaCall = makeRealm();
export const fromCall = viaCall.Map.groupBy([1], x => x);

function identity(value) { return value; }
const viaIdentity = identity(globalThis);
export const fromIdentity = viaIdentity.Object.hasOwn({}, 'k');

let held;
const viaChainAssign = held = globalThis;
export const fromChainAssign = viaChainAssign.Array.fromAsync([2]);

const [viaSlot] = [globalThis];
export const fromSlot = viaSlot.Promise.try(() => 1);
