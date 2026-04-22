class C {
  #foo = 42;
  read() {
    return this.#foo;
  }
}
new C().read();