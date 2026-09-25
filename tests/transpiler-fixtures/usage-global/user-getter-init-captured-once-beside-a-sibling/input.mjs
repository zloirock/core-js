// a user GETTER typed to a constructor (`KE.A`, `OE.A`) under a nested instance claim beside a
// sibling is read ONCE: one capture serves the nested claim and the sibling alike - beside a static,
// a residual, two nested claims, exported, beside a sibling declarator, in an assignment and with the
// static written first; `Array` itself needs none
class KE {
  static get A() { log(); return Array; }
  static get I() { log(); return Iterator; }
  static get P() { log(); return Promise; }
}
const OE = { get A() { log(); return Array; } };
const { prototype: { at: m1 }, from: a1 } = KE.A;
const { prototype: { flat: m2 }, foo: r2 } = KE.A;
const { prototype: { with: m3, toSorted: f3 }, bar: a3 } = KE.A;
const { prototype: { findLast: m4 }, fromAsync: a4 } = OE.A;
export const { prototype: { drop: m5 }, concat: a5 } = KE.I;
const z6 = 1, { prototype: { take: m6 }, from: a6 } = KE.I;
const { prototype: { flatMap: m7 }, isArray: a7 } = Array;
let m8, a8;
({ prototype: { toReversed: m8 }, of: a8 } = KE.A);
const { try: a9, prototype: { finally: m9 } } = KE.P;
use(m1, a1, m2, r2, m3, f3, a3, m4, a4, z6, m6, a6, m7, a7, m8, a8, a9, m9);
