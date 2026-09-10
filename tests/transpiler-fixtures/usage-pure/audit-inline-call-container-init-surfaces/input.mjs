// pure substitutes what it resolves, so the boundary of the inline-call container peel is observable
// here: a container bound by a zero-arg call reads like a literal container, while a callee whose
// body does not run at the call and one no proof reaches leave the read native.
const wrap = (() => ({ realm: globalThis }))();
export const resolved = wrap.realm.Array.from([1]);

// the body does not run at the call - the value is a promise, an iterator, an instance
const asyncWrap = (async () => ({ realm: globalThis }))();
export const viaAsync = asyncWrap.realm.Array.from([2]);
const genWrap = (function * () { return { realm: globalThis }; })();
export const viaGenerator = genWrap.realm.Array.from([3]);
const newWrap = new (function () { return { realm: globalThis }; })();
export const viaNew = newWrap.realm.Array.from([4]);

// a parameter the body only PLACES IN A SLOT is the argument that slot holds: the call yields the
// literal, the binding holds it, and the read through the slot lands on what the call passed there
const paramWrap = (x => ({ realm: x }))(globalThis);
export const viaParam = paramWrap.realm.Array.from([5]);
