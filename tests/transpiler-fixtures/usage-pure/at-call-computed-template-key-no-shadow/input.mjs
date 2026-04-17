class C extends Array {
  [`at${""}`]() {}
  foo() { return this.at(0); }
}
