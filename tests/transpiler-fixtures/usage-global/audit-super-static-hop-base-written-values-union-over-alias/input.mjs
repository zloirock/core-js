let switchNs;
switch (c) { case 1: switchNs = { Base: Boolean }; break; default: switchNs = { Base: Reflect }; }
const viaAlias = switchNs;
class OverAlias extends viaAlias.Base {
  static go() { return super.ownKeys({}); }
}
export { OverAlias };
