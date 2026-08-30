import _globalThis from "@core-js/pure/actual/global-this";
// a SEQUENCE the source wrote around a folded navigation hands its TAIL on, so a `?.` reading that
// sequence reads the substituted binding and is as vestigial as one reading it directly. the erase
// compared the member's object against the REPLACEMENT and could not see through the prefix, so the
// `?.` stood over `(eff(), _globalThis)` - a binding that is never nullish. the printer wrappers the
// source wrote around the sequence sit between it and the `?.`, so the peel takes them too.
// the mutated slot is what keeps the claim from consuming the whole span: without it the static
// substitutes and no `?.` survives to judge
let out;
function eff() {}
_globalThis.Number = {
  MAX_SAFE_INTEGER: 1
};
out = (eff(), _globalThis).Number.MAX_SAFE_INTEGER;
// a bare ROOT swap inside the same shape keeps its `?.`: the source read the root directly, nothing
// was folded away, and that guard is the source's own
out = (0, _globalThis)?.Number.MAX_SAFE_INTEGER;
export const read = out;