class C extends Array {
  static at() { return 'static-at'; }
  foo() { return this.at(0); }
}
