// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
class KE {
  static get I() { log(); return Iterator; }
}
const z1 = log(), { M: { from: s1, name: nm1 } } = { M: KE.I };
use(z1, s1, nm1);
