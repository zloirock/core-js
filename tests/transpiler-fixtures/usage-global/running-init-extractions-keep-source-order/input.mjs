// an init that RUNS code is evaluated once, before any binding, and the extractions then bind in
// SOURCE order whichever prop empties the host - a declaration, an assignment, a member target, an
// export, a sibling declarator, and behind a sequence or a getter-read prefix
class K { static get g() { log(); return 0; } }
function mkArray() { log(); return Array; }
function mkObject() { log(); return Object; }
function mkIterator() { log(); return Iterator; }
function mkPromise() { log(); return Promise; }
function mkMath() { log(); return Math; }
const ob = {};
const { from: a1, of: b1 } = mkArray();
let a2, b2;
({ fromEntries: a2, groupBy: b2 } = mkObject());
({ from: ob.a, concat: ob.b } = mkIterator());
export const { try: a4, withResolvers: b4 } = mkPromise();
const z5 = 1, { sumPrecise: a5, f16round: b5 } = mkMath();
let a6, b6;
({ fromAsync: a6, isArray: b6 } = (n++, mkArray()));
const { allSettled: a7, any: b7 } = (K.g, mkPromise());
let a8, b8;
({ entries: a8, hasOwn: b8 } = (K.g, mkObject()));
use(a1, b1, a2, b2, ob, a4, b4, z5, a5, b5, a6, b6, a7, b7, a8, b8);
