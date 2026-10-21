// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
class KE {
  static get I() { log(); return Iterator; }
}
const { A: { from: a4 }, M: { zip: s4, name: nm4 } } = { A: Array, M: KE.I };
use(a4, s4, nm4);
