// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// in a declarator that has a sibling.
class KE {
  static get I() { log(); return Iterator; }
}
const z1 = log(), { M: { from: s1, name: nm1 } } = { M: KE.I };
use(z1, s1, nm1);
