import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _self from "@core-js/pure/actual/self";
// A case-level lexical binding covers the case block, not the discriminant. The discriminant still reads the outer realm or
// constructor alias.
let y1 = {};
switch (_flatMaybeArray(_self.Array.prototype).call([1, [2]]).length) {
  case 1:
    let globalThis = y1;
    break;
}
export { y1 };