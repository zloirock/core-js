// A preceding declarator finishes before the constructor-valued getter is captured.
// The from and name extractions keep that source order.
class KE {
  static get I() { log(); return Iterator; }
}
const z1 = log(), { M: { from: s1, name: nm1 } } = { M: KE.I };
use(z1, s1, nm1);
