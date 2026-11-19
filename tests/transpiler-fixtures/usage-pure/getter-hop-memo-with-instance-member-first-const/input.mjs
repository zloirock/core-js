// A getter hop read by an instance member and then a static member is memoized once before
// either read in a const declarator.
class KE {
  static get P() { log(); return Promise; }
}
const { M: { name: nm8, allSettled: s8 } } = { M: KE.P };
use(nm8, s8);
