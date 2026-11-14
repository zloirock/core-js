import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A private call behind the realm guard retains its key and original receiver.
export class Reader {
  #read() {
    return this;
  }
  call() {
    return null == _globalThis.window ? void 0 : _self.#read();
  }
}