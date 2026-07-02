class C extends globalThis['Array'] {
  static fromX(x) {
    return super.from(x);
  }
}
