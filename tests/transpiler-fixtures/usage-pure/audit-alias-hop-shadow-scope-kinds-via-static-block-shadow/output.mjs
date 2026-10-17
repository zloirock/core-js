import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// class static block
const staticRoot = _Promise;
const staticLink = staticRoot;
export class ViaStaticBlockShadow {
  static {
    const staticRoot = {};
    const attempt = _Promise$try;
    ViaStaticBlockShadow.v = attempt;
  }
}