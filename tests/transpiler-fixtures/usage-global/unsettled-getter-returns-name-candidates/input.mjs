// a getter whose body the single-return proof cannot settle (`try`, `switch`, `finally`) still hands
// the injecting flavor the constructors its returns spell, so a static read through it is polyfilled
// wherever it may run
class KE {
  static get I() { try { log(); } catch {} return Iterator; }
  static get S() { switch (n) { case 0: return Promise; default: return Math; } }
}
const o = { get M() { try { log(); } finally {} return Map; } };
const { M: { from: s1 } } = { M: KE.I };
const { try: s2 } = KE.S;
use(s1, s2, o.M.groupBy);
