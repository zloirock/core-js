// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// in a bodyless if slot.
class KE {
  static get P() { log(); return Promise; }
}
if (c) var { M: { try: s2, name: nm2 } } = { M: KE.P };
use(s2, nm2);
