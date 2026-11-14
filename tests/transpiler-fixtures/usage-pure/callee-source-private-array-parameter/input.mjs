// A private static parameter has a closed caller supplying Array.
// Its static read is served without opening the caller set for the private key.
class Factory {
  static #read(C) {
    return C.from([3]);
  }
  static run() {
    return Factory.#read(Array);
  }
}
Factory.run();
