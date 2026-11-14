// A private call behind the realm guard retains its key and original receiver.
export class Reader {
  #read() { return this; }
  call() { return globalThis.window?.self.#read(); }
}
