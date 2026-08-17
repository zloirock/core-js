// the hop directly above a seal is itself a proxy hop, so the guard render absorbs it and the
// paren goes with it. the read at that hop is the source's own throw and must survive: no fold
// into the guarded alternate, and no `?.` handed back where the source wrote a plain read
export function viaParamDefault({ at } = (globalThis.window?.self).self.box) {
  return at;
}

export let stored;
export const viaChainAssign = (stored = (globalThis.window?.self).self.box).at(0);

export const viaDelete = delete (globalThis.window?.self).self.box.at;

// NEGATIVE, opposite polarity: the `?.` sits OUTSIDE the seal, so the sealed value is what the
// short-circuit produced and the plain read above it observes that - a throw either way, and the
// guard belongs INSIDE the dispatch argument rather than around it
export const viaOuterOptional = ((globalThis.window)?.self).self.box.at(0);

// the same polarity over a chain-ASSIGN root: the write stores the nav and the seal observes what
// it produced, so the dropped hop's `?.` may not be re-hung on the leaf - the read is plain and
// throws. the value question reads THROUGH the write here; the routing verdict deliberately does
// not, because flipping that globally strands a raw root in a guard memo
export let held;
export const viaChainAssignRoot = ((held = globalThis.window)?.self).self.box.at(0);

// NEGATIVE: a seal over an always-defined value (the parens only group the assignment) is not a
// read the guard can swallow - the fold keeps running there
export let grouped;
export const viaGroupedAssign = (grouped = globalThis).window?.self.box.at(0);
