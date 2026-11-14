// Consuming a private slot permits revisiting its class through a public pattern.
class Same {
  static #owner = Same;
  static ['#owner'] = Object;
  static read() {
    const { ['#owner']: { groupBy } } = Same.#owner;
    return groupBy([3], String)['3'];
  }
}
console.log(Same.read());
