// dominance-aware alias walk: the const captures G.Array BEFORE the upstream reassignment,
// so the reassignment cannot reach the capture read and super.<static> still resolves (a
// flat constant-violations bail dropped the polyfill and threw on ie11)
let G = globalThis;
const Base = G.Array;
G = null;
class C extends Base {
  static make() {
    return super.from([1]);
  }
}
C.make();
