// a proxy root can be captured through a MEMBER read (`const s = globalThis.self`), not only through a
// bare name. both sides follow that init through ONE walk - the proxy recogniser narrows the value
// canon's answer to the realm names rather than re-deriving it. the rows pin the capability: an alias
// bound to a member read still names the proxy surface, so a mutation through it registers and a plain
// read through it resolves. the second row is the Identifier-init twin
const viaMember = globalThis.self;
const viaName = globalThis;

// the alias holds a member-captured proxy root: the read through it must resolve to the global surface
export function memberCapturedRootResolves() {
  return viaMember.Array.from([1, 2]).at(0);
}

// the Identifier-init twin: the same capability through a bare-name capture
export function nameCapturedRootResolves() {
  return viaName.Array.from([3, 4]).includes(3);
}
