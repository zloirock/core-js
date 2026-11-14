import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// Consuming a private slot permits revisiting its class through a public pattern.
class Same {
  static #owner = Same;
  static ['#owner'] = Object;
  static read() {
    const groupBy = _Object$groupBy;
    return groupBy([3], String)['3'];
  }
}
console.log(Same.read());