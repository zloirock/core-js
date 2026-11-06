// A sequence initializer evaluates its prefix before the Iterator-valued getter.
// The served concat and name leaves share the captured result.
class KE {
  static get I() { log(); return Iterator; }
}
const { M: { concat: s3, name: nm3 } } = (n++, { M: KE.I });
use(s3, nm3);
