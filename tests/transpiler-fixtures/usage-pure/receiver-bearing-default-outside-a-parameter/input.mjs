// a nested default that CARRIES the receiver: the outer slot is unknown, so what runs when it is
// undefined IS the default - and a mirror of that default fires under exactly the same condition,
// which makes it correct on every host, not only in a parameter list. one static per host so a
// dropped host is visible in the import set. the last three are controls: a proxy-global receiver
// still resolves through the OUTER chain and flattens, a default carrying no receiver stays native,
// and a resolvable outer chain leaves its dead default alone
const src = {};
const flag = true;
const list = [];
function use() { /* empty */ }
function raise() { /* empty */ }
const { a: { from } = Array } = src;
let entries;
({ b: { entries } = Object } = src);
try { raise(); } catch ({ c: { allSettled } = Promise }) { use(allSettled); }
for (const { d: { isFinite } = Number } of list) use(isFinite);
const { e: { f: { groupBy } = Map } } = src;
export const { g: { raw } = String } = src;
const { Array: { of } = {} } = globalThis;
const { h: { plain } = {} } = src;
const { Set: { union } = Set } = globalThis;
// a BRANCHY default declines: this channel answers with a receiver NAME, and a name cannot say
// "either branch" - mirroring one of them would emit the wrong branch's static whenever the other
// fires. the flat twin affords these shapes only because its meta carries a fallback flag
const { b1: { from: fromOr } = Array || Iterator } = src;
const { b2: { from: fromTernary } = flag ? Array : Iterator } = src;
// an INSTANCE claim answers differently: a dispatch can reach BOTH arms, so it folds them - one
// read of the slot, the default only where the source evaluates it - and the default's shape does
// not divide that (the `list` row and the `raise()` row fold alike). the mirror keeps the arm no
// dispatch reaches: a PARAMETER's default, whose live arm is whatever the caller passes
const { i1: { flat } = list } = src;
function withDefault({ i2: { includes } = list } = {}) { return includes; }
const { i3: { at } = raise() } = src;
use(from, entries, of, plain, union, groupBy, flat, at, withDefault(), fromOr, fromTernary);
