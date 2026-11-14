// A private method and a public string key select different returned values.
const effects = [];
let r;
class F {
  static #c() {
    return {
      withResolvers: 17
    };
  }
  static ["#c"]() {
    return Promise;
  }
  static run() {
    return [F.#c().withResolvers, typeof F["#c"]().withResolvers];
  }
}
r = F.run();
export { r, effects };
