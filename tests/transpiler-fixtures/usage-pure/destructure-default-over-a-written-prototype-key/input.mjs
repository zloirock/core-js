// a slot default fires only where the slot is undefined, and a key the FILE writes onto a prototype
// is one every literal of that chain inherits - an array hole included: none of the first three
// bindings is certainly its default, so pure guards each static read on the default's constructor and
// usage-global injects for it. a key nothing writes there, and a slot past an array's end, which the
// iterator never reads, stay certain, and pure reads the default's static outright
Object.prototype.lent = Set;
const { lent: L = Array } = {};
export const viaWrite = L.of(1);
Object.defineProperty(Object.prototype, 'given', { value: Set });
const { given: G = Object } = {};
export const viaDefine = G.fromEntries([]);
Array.prototype[0] = Set;
const [H = Map] = [,];
export const viaHole = H.groupBy([], x => x);
const { other: O = Promise } = {};
export const viaUnwritten = O.allSettled([]);
const [P = URL] = [];
export const viaPastTheEnd = P.canParse('a:b');
