// the proxy root stays visitable only while the emitted text still carries it RAW. every render
// that spells the root itself - a paren-sealed guard test, a chain-assign whose hops the guard
// collapsed, an alias chain a ctor-static claim erases - owns that substitution, and a rewrite
// left queued on the deleted spelling has nowhere to compose. the last two rows are the negative:
// there the guard memo re-emits the root verbatim, so its own rewrite must stay live.
// `collapsedStatic` pins the receiver-guard channel against its sibling one line up: the SAME
// receiver under an instance claim and under a static one collapses its pristine hops the same
// way, or the guard TEST reads a raw hop off a root that does not carry it
const alias = globalThis;
let assigned, kept, mid;
export const sealedRoot = (globalThis)?.window?.Array.prototype.includes.call([1], 1);
export const collapsedHops = (assigned = globalThis.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(1);
export const collapsedStatic = (kept = globalThis.self.window)?.Map.length;
export const aliasCtorStatic = alias.self.Number.MAX_SAFE_INTEGER.toFixed(1);
export const rawGuardMemo = globalThis.baz?.name.includes('z');
export const rawMidHop = (mid = globalThis).baz?.name.includes('y');
