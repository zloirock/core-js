// a receiver LIFTED out of a consumed hop literal is a node no walk revisits: spelled raw it reads
// a global the engine may not have, so the dispatch takes the pure binding that stands for it -
// the same answer the flat init arm gives, and the one babel's own re-visit produces. the claims
// here are the ones that legitimately dispatch ON such a receiver: the well-known-symbol read,
// whose helper answers `undefined` exactly where the raw read would, and the statics behind it
const { w: { [Symbol.iterator]: hopIterator } } = { w: globalThis };
const { w: { [Symbol.iterator]: selfIterator } } = { w: self };
const { w: { x: { [Symbol.iterator]: deepIterator } } } = { w: { x: globalThis } };
// ... and a NAV rooted in a proxy global names the ponyfill it stands for: a member read off the
// realm object is undefined wherever the engine lacks the property the nav spells
const { w: { [Symbol.iterator]: navHop } } = { w: globalThis.self };
// ... and the shapes that claim NOTHING here, locked as the negatives they are: a key the resolved
// receiver does not have is not a claim at all, and the hop answers exactly what the flat spelling
// of the same receiver answers - silence (`{ at } = globalThis` injects nothing either)
const { w: { at: noClaimOnRealm } } = { w: globalThis };
const { w: { at: noClaimOnNav } } = { w: globalThis.globalThis };
const { w: { at: noClaimOnCtor } } = { w: Array };
const aliasedRealm = globalThis;
const { w: { at: noClaimOnAlias } } = { w: aliasedRealm };
// ... and the ARRAY wrapper answers its flat twin the same way: the element it pairs with is the
// receiver, and a key that receiver does not have is no claim there either
const [{ at: noClaimInWrapper }] = [globalThis];
const [{ [Symbol.iterator]: wrapperIterator }] = [globalThis];
// ... and an ASSIGNMENT host carries the same claim through its overwrite: no declaration hosts a
// `const` there, so the pattern assigns natively and the ponyfill re-binds the local right after
let assigned;
({ w: { [Symbol.iterator]: assigned } } = { w: globalThis });
export { hopIterator, selfIterator, deepIterator, navHop, assigned,
  noClaimOnRealm, noClaimOnNav, noClaimOnCtor, noClaimOnAlias, noClaimInWrapper, wrapperIterator };
