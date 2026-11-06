// a binding names the realm by the VALUE it holds, and that value is the resolution canon's question
// - the proxy narrow only keeps the realm names off its answer. a copy that walked the init itself
// bottomed out on two terminals, so a call-captured root read as "no proxy" HERE while the global-read
// channel called it the realm: the static below it then rode a `*/constructor` binding that carries no
// statics at all. one spelling per line - a shared method would mask the neighbours' regression
function makeRealm() { return globalThis; }
const viaCall = makeRealm();
export const fromCall = viaCall.Map.groupBy([1], x => x);

function identity(value) { return value; }
const viaIdentity = identity(globalThis);
export const fromIdentity = viaIdentity.Object.hasOwn({}, 'k');

let held;
const viaChainAssign = held = globalThis;
export const fromChainAssign = viaChainAssign.Array.from('ab');

const [viaSlot] = [globalThis];
export const fromSlot = viaSlot.Promise.resolve(1);
