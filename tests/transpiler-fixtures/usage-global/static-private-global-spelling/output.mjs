class Priv {
  static #WeakMap = 1;
  static read() {
    return this.#WeakMap;
  }
}
export { Priv };