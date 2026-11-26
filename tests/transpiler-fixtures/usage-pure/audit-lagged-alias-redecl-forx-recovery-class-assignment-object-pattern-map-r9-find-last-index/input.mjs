class C {
  static {
    let T;
    ({ Map: T } = globalThis);
    T = [6];
    T.at(0);
    C.r9 = T.findLastIndex(Boolean);
  }
}
export { C };
