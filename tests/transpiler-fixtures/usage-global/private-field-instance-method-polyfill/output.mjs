class C {
  #bag = {
    at: () => null,
    flat: () => null
  };
  peek(i) {
    return this.#bag.at(i);
  }
  spread() {
    return this.#bag.flat();
  }
}