import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
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
    return _Promise;
  }
  static run() {
    return [F.#c().withResolvers, typeof (F["#c"](), _Promise$withResolvers)];
  }
}
r = F.run();
export { r, effects };