// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
class KE {
  static get I() { log(); return Iterator; }
}
const { M: { concat: s3, name: nm3 } } = (n++, { M: KE.I });
use(s3, nm3);
