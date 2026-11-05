// A bodyless conditional keeps a Promise-valued getter and both extracted leaves inside its guard.
// The static try import and name dispatch share the captured constructor.
class KE {
  static get P() { log(); return Promise; }
}
if (c) var { M: { try: s2, name: nm2 } } = { M: KE.P };
use(s2, nm2);
