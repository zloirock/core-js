import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// Public pattern keys remain public after consuming a private class slot.
class Inner {
  static ['#owner'] = Object;
}
class Outer {
  static #owner = Inner;
  static read() {
    const groupBy = _Object$groupBy;
    return groupBy([3], String)['3'];
  }
}
console.log(Outer.read());