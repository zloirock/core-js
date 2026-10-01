class C extends Array {
  static at() { return 'static-at'; }
  at() { return 'instance-at'; }
  foo() { return this.at(0); }
}
