import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// A static claim over a PROVEN proxy-global root (a literal or a bare-global alias) shares one
// source of undefined - the window hop - so a single test expresses the union and the claim
// emits guarded (`null == root.window ? void 0 : <claim>`), the ponyfillable `self` hop
// subsumed. covers the static-ERASE claim (a ctor: `.Set`) and the static-FALLBACK swap (an
// unknown member off a ctor: `.Promise.noSuchStatic`), rooted at a LITERAL proxy global and at
// an ALIAS of one (the alias binding stays the guard-test spelling). no DEAD pure import may
// strand either way
const g = _globalThis;

// literal root: ONE window test guards the claim, the branch reads the ponyfill ctor
export const litErased = null == _globalThis.window ? void 0 : _Set;

// literal root through the static-FALLBACK path; root collapses, NO dead `_Promise`
export const litFell = null == _globalThis.window ? void 0 : _Promise.noSuchStatic;

// alias root: the bare-global alias proves like the literal - ONE window test guards the
// claim off the alias binding, the branch reads the ponyfill ctor
export const aliasErased = null == g.window ? void 0 : _Map;

// the alias proof is scope-correct in BOTH directions. a module-level alias of the bare
// global read under a same-name param SHADOW still proves - the alias binds the module
// global, the shadow never feeds it
const h = g;
export function readUnderShadow(g) {
  return null == h.window ? void 0 : _WeakMap;
}

// the REVERSE stands down: an alias of the PARAM (an arbitrary caller value) is not the
// global, so the raw chain keeps its own guards - and still NO dead pure import may strand
export function paramAliasStaysRaw(g) {
  const p = g;
  return p.window?.self?.WeakSet;
}

// declaration ORDER does not break the proof: the closure reads aliases declared after it -
// a legal call still sees the assigned globals, and an early call throws the same TDZ
// ReferenceError raw or guarded (faithful-throw)
export function readBeforeDecls() {
  return null == laterAlias.window ? void 0 : _Promise;
}
const laterG = _globalThis;
const laterAlias = laterG;