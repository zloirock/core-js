// a realm name read as a KEY (`globalThis.self`) ahead of the realm's own install is the realm this build serves,
// as the bare name read there is: each spelling takes what it takes with no install - the hop folds, and the
// static, prototype, iterator or test off it reads the pure import, and so does an alias captured there. a read
// deferred into a function may run after the install, so it stays the user's
let q;
const alias = self;
const g = globalThis;
export const fromHop = globalThis.self.Array.from(list);
export const protoHop = globalThis.self.Array.prototype.at;
export const iterHop = globalThis.self[Symbol.iterator];
export const testedHop = globalThis.self ? globalThis.self.Promise.resolve(1) : null;
export const { of } = globalThis.self.Array;
export const storedHop = (q = globalThis.self).Map.groupBy;
export const aliased = alias.Array.of(3, 4);
export const viaAlias = g.self.Array;
export const viaAliasKey = g['self'].Array.prototype;
export const optionalHop = globalThis?.self.Array.prototype.includes;
export const typedChain = globalThis.self.Array.from(list).at(-1);
export const selected = (c ? globalThis : user).self;
export const deferredHop = () => globalThis.self.Array.of(1);
export const realm = self;
export const fromRealm = self.Array.from(list);
export { q };
globalThis.self = globalThis;
