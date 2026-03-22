function foo(x) {
  if (!(x instanceof this.Array)) x.at(0);
}
