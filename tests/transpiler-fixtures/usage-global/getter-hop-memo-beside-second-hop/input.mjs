// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// beside a second hop.
class KE {
  static get I() { log(); return Iterator; }
}
const { A: { from: a4 }, M: { zip: s4, name: nm4 } } = { A: Array, M: KE.I };
use(a4, s4, nm4);
