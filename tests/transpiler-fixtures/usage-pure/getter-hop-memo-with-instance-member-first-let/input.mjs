// A getter hop read by an instance member and then a static member is memoized once before
// either read in a let declarator.
class KE {
  static get P() { log(); return Promise; }
}
let { M: { name: nm9, any: s9 } } = { M: KE.P };
use(nm9, s9);
