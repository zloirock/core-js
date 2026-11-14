// Public pattern keys remain public after consuming a private class slot.
class Inner {
  static ['#owner'] = Object;
}
class Outer {
  static #owner = Inner;
  static read() {
    const { ['#owner']: { groupBy } } = Outer.#owner;
    return groupBy([3], String)['3'];
  }
}
console.log(Outer.read());
