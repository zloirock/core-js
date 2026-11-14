// A private static callable supplies the constructor used by its caller.
const effects = [];
let r;
class F {
  static #c = () => Promise;
  static run() {
    return typeof F.#c().withResolvers;
  }
}
r = F.run();
export { r, effects };
