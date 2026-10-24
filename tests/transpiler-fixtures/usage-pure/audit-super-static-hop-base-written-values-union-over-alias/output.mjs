import _Reflect from "@core-js/pure/actual/reflect";
let switchNs;
switch (c) {
  case 1:
    switchNs = {
      Base: Boolean
    };
    break;
  default:
    switchNs = {
      Base: _Reflect
    };
}
const viaAlias = switchNs;
class OverAlias extends viaAlias.Base {
  static go() {
    return super.ownKeys({});
  }
}
export { OverAlias };