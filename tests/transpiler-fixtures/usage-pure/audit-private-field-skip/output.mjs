// class private field name (`#x`) is not a runtime polyfill candidate even if it
// shares spelling with a polyfillable identifier - the access must be left as-is.
class C {
  #foo = 42;
  read() {
    return this.#foo;
  }
}
new C().read();