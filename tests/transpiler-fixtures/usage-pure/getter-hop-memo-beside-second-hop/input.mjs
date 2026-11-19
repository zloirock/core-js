// A captured Iterator-valued getter supplies both zip and name after the preceding native Array.from read.
// The getter runs once and zip receives its own static import.
class KE {
  static get I() { log(); return Iterator; }
}
const { A: { from: a4 }, M: { zip: s4, name: nm4 } } = { A: Array, M: KE.I };
use(a4, s4, nm4);
