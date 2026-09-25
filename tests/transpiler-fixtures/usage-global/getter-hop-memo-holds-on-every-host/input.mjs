// a getter hop read by a static and an instance member (`{ M: KE.I }`) is memoized once, ahead of the
// static, on every host - a sibling declarator, a bodyless slot, a sequence init, beside a second hop,
// an export, with the instance member written first - and a prefixed sole instance leaf or a
// multi-leaf assignment carries its prefix into the one read it performs
class KE {
  static get I() { log(); return Iterator; }
  static get P() { log(); return Promise; }
}
function g() { log(); return [1, [2]]; }
const z1 = log(), { M: { from: s1, name: nm1 } } = { M: KE.I };
if (c) var { M: { try: s2, name: nm2 } } = { M: KE.P };
const { M: { concat: s3, name: nm3 } } = (n++, { M: KE.I });
const { A: { from: a4 }, M: { zip: s4, name: nm4 } } = { A: Array, M: KE.I };
export const { M: { withResolvers: s5, name: nm5 } } = (n++, { M: KE.P });
const { M: { name: nm8, allSettled: s8 } } = { M: KE.P };
let { M: { name: nm9, any: s9 } } = { M: KE.P };
const { m: { at: s6 } } = (n++, h);
let s7, f7;
({ M: { findLast: s7, flat: f7 } } = (n++, { M: g() }));
use(z1, s1, nm1, s2, nm2, s3, nm3, a4, s4, nm4, s6, s7, f7, nm8, s8, nm9, s9);
