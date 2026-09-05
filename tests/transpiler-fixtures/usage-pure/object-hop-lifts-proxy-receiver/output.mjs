import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a receiver LIFTED out of a consumed hop literal is a node no walk revisits: spelled raw it reads
// a global the engine may not have, so the dispatch takes the pure binding that stands for it -
// the same answer the flat init arm gives, and the one babel's own re-visit produces. the claims
// here are the ones that legitimately dispatch ON such a receiver: the well-known-symbol read,
// whose helper answers `undefined` exactly where the raw read would, and the statics behind it
const hopIterator = _getIteratorMethod(_globalThis);
const selfIterator = _getIteratorMethod(_self);
const deepIterator = _getIteratorMethod(_globalThis); // ... and a NAV rooted in a proxy global names the ponyfill it stands for: a member read off the
// realm object is undefined wherever the engine lacks the property the nav spells
const navHop = _getIteratorMethod(_self); // ... and the shapes that claim NOTHING here, locked as the negatives they are: a key the resolved
// receiver does not have is not a claim at all, and the hop answers exactly what the flat spelling
// of the same receiver answers - silence (`{ at } = globalThis` injects nothing either)
const {
  w: {
    at: noClaimOnRealm
  }
} = {
  w: _globalThis
};
const {
  w: {
    at: noClaimOnNav
  }
} = {
  w: _globalThis
};
const {
  w: {
    at: noClaimOnCtor
  }
} = {
  w: Array
};
const aliasedRealm = _globalThis;
const {
  w: {
    at: noClaimOnAlias
  }
} = {
  w: aliasedRealm
};
// ... and the ARRAY wrapper answers its flat twin the same way: the element it pairs with is the
// receiver, and a key that receiver does not have is no claim there either
const [{
  at: noClaimInWrapper
}] = [_globalThis];
const wrapperIterator = _getIteratorMethod(_globalThis); // ... and an ASSIGNMENT host carries the same claim through its overwrite: no declaration hosts a
// `const` there, so the pattern assigns natively and the ponyfill re-binds the local right after
let assigned;
assigned = _getIteratorMethod(_globalThis);
export { hopIterator, selfIterator, deepIterator, navHop, assigned, noClaimOnRealm, noClaimOnNav, noClaimOnCtor, noClaimOnAlias, noClaimInWrapper, wrapperIterator };