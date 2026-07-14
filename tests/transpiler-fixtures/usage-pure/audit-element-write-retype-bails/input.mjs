import iterSym from "s";

// element-type precision holds only while nothing can retype the elements between the
// array's creation and the read: an element write flips the family at runtime, so the
// read bails to the generic helper instead of keying a wrong-family Maybe (ie:11)
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = written[0].at(0);

// a read-only-referenced literal keeps its per-element precision
const sealed = [[1], [2]];
export const viaSealedRead = sealed[0].includes(1);

// a mutating method retypes elements the same way an element write does - which methods
// mutate is registry data, not local knowledge
const pushed = [[1], [2]];
pushed.push([3]);
export const viaMutatorCall = pushed[0].at(0);

// a method the registry does not know may be any mutator at runtime, so it bails too
const custom = [[1], [2]];
custom.custom();
export const viaUnknownCall = custom[0].includes(3);

// a registry-known non-mutating method keeps the per-element precision
const scanned = [[1], [2]];
scanned.forEach(f);
export const viaSafeCall = scanned[0].at(1);

// an optional-chained mutator call bails the same way as the plain spelling
const filled = [[1], [2]];
filled?.fill(["x"]);
export const viaOptionalMutator = filled[0].at(2);

// a registry METHOD read outside a call position extracts the function value - its later
// call is untrackable, so the extraction bails regardless of which method leaves
const extracted = [[1], [2]];
const m = extracted.splice;
export const viaMutatorExtraction = extracted[0].includes(5);
const lent = [[1], [2]];
use(lent.includes);
export const viaSafeExtraction = lent[0].at(-1);

// non-method member reads stay plain reads - element precision survives
const measured = [[1], [2]];
use(measured.length, measured.custom);
export const viaPropertyReads = measured[0].includes(7);

// an optional-chained SAFE method keeps the precision - the optional lowering must not
// degrade a registry-known non-mutating call into an unknown one
const opted = [[1], [2]];
opted?.includes(9);
export const viaOptionalSafeCall = opted[0].at(3);

// a call through a DYNAMIC (symbol / unresolved) key may be any mutator - it bails
const keyed = [[1], [2]];
keyed[iterSym]();
export const viaDynamicKeyCall = keyed[0].at(4);

// element precision recurses through nested literal layers
const nested = [[[1]], [[2]]];
export const viaNestedRead = nested[0][0].includes(1);

// a registry-safe COPYING method (with / toSpliced / toSorted return copies) keeps precision
const copied = [[1], [2]];
use(copied.with(0, [9]));
export const viaCopyingMethod = copied[0].at(5);

// a spread hands every element out at once - the holder may write elements, so it bails
const fanned = [[1], [2]];
use([...fanned]);
export const viaSpreadEscape = fanned[0].includes(8);

// a `length` write truncates arbitrary indices - a member WRITE host bails
const trimmed = [[1], [2]];
trimmed.length = 1;
export const viaLengthWrite = trimmed[0].at(6);

// a destructure slot copies the element value at execution - the READ through the slot keeps
// precision, while the destructured SOURCE binding classifies conservatively as an escape
const [headSlot] = [[7], [8]];
export const viaDestructureSlot = headSlot.includes(7);
const source = [[1], [2]];
const [drawn] = source;
export const viaDestructureSource = source[0].at(10);

// a SHADOWING inner binding's mutator does not poison the outer binding - references are
// scope-discriminated
const shaded = [[1], [2]];
{ const shaded = [9]; shaded.fill(0); }
export const viaShadowedMutator = shaded[0].at(7);

// an alias hands the same array to another binding - a mutator through the alias is
// invisible to this walk, so the aliasing itself bails
const origin = [[1], [2]];
const alias = origin;
alias.fill("x");
export const viaAliasedMutation = origin[0].includes(9);

// a dominating whole-binding reassign IS the value source - precision comes from the new init
let replaced = [[1], [2]];
replaced = [[9]];
export const viaWholeReassign = replaced[0].at(8);

// iteration hands elements out like a spread does - it bails
const looped = [[1], [2]];
for (const el of looped) use(el);
export const viaForOfEscape = looped[0].at(9);

// a delete is an element write host
const gapped = [[1], [2]];
delete gapped[0];
export const viaDeleteWrite = gapped[0].includes(2);
