import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A private call behind the realm guard retains its key and original receiver.
export class Reader {
  #read() {
    return this;
  }
  call() {
    return globalThis.window?.self.#read();
  }
}