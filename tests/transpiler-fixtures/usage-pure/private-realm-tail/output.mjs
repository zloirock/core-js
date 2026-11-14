import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The retained private key keeps its spelling and native brand check after a realm guard.
export class Reader {
  #value = 3;
  read() {
    return null == _globalThis.window ? void 0 : _self.#value;
  }
}