import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A closure in the second static block reads its string, not the first block's array.
class N {
  static {
    const s = [1, 2];
  }
  static {
    const s = 'ab';
    const f = () => _atMaybeString(s).call(s, -1);
    f();
  }
}