class ViaSuper extends Object {
  m() {
    // @ts-expect-error an instantiation over a value with no generic signature is the shape under test
    return super.valueOf<string>(1);
  }
}