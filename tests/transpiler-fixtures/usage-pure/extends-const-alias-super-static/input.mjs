const Base = Array;
class A extends Base {
  static foo() {
    return super.from([1, 2, 3]);
  }
}
