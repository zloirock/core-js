// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// when its initializer is a sequence.
class KE {
  static get I() { log(); return Iterator; }
}
const { M: { concat: s3, name: nm3 } } = (n++, { M: KE.I });
use(s3, nm3);
