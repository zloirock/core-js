// TS/accessor member names are SOURCE-TEXT names, never runtime references. two independent consequences,
// both locked here:
//   1. a UID-shaped name in such a slot must NOT reserve the slot, so the memo takes the LOW number - a
//      type-space property signature, an enum member, an `accessor` key and an `abstract` property key.
//      METHOD-shaped signatures are the boundary: babel's live scope does claim those, so they still
//      reserve and the memo there takes the NEXT number.
//   2. a GLOBAL-shaped key must NOT be rewritten to the polyfill import - an `abstract` member key named
//      `Map` stays `Map` (renaming it would silently change the class contract).
// distinct method per line.
interface Sig { _ref: number }
export const r1 = [10, 20].at(0);
enum Members { _ref }
export const r2 = [[1], [2]].flat();
class Acc { accessor _ref = 1; }
export const r3 = [3, 4].includes(3);
abstract class AbsProp { abstract _ref: number; }
export const r4 = [5, 6].findLast(x => x > 5);
abstract class Contract { abstract Map: number; abstract Promise(): void; }
export const r5 = new Map();
interface MethodSig { _ref(): void }
export const r6 = [7, 8].findIndex(x => x === 7);
export type { Sig, MethodSig };
export { Members, Acc, AbsProp, Contract };
