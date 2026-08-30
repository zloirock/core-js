// the same prefix rule where the host has no statement slot to lift into. a bodyless control slot
// is BRACED first, so the effect stays conditional; a multi-declarator host SPLITS and the prefix
// opens its own declarator's group, past the sibling init that runs before it - and so does the
// extraction of a prop whose OWN key carries an effect, whose key then runs where it stands; a for-init header
// hosts no statement at all, so the prefix rides the FIRST extraction's value; an ARRAY WRAPPER
// keeps its literal in the residual and takes the lift ahead of the extraction like a plain host.
// the negative: a nested hop or a rest sibling re-reads the receiver through the residual, so
// there the whole read stays where it was written.
function eff() {}
function pre() {}
var bm, bo;
if (globalThis) ({ Map: bm, other: bo } = (eff(), globalThis));
if (globalThis) var { Set: bs, alsoOther } = (eff(), globalThis);
var first = pre(), { WeakMap: dw, stillOther } = (eff(), globalThis);
let kk = 0;
var lead = pre(), { [(kk++, 'of')]: ko, alsoMore } = (eff(), Array);
for (var { WeakSet: fw, moreOther } = (eff(), globalThis); false;) break;
var [{ Map: aw }, alsoWrapped] = (eff(), [globalThis, 1]);
for (const { Array: { from: nf }, ...rest } = (eff(), globalThis); false;) break;
export const r = [bm, bo, bs, alsoOther, first, dw, stillOther, lead, ko, alsoMore, kk, fw, moreOther, aw, alsoWrapped, nf, rest];
