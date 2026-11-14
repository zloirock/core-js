// The retained private key keeps its spelling and native brand check after a realm guard.
export class Reader {
  #value = 3;
  read() { return globalThis.window?.self.#value; }
}
