class C {
  #at(i) {
    return i;
  }
  get(i) {
    return this.#at(i);
  }
}