import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// PrivateIdentifier in static and instance context. Both parsers emit identical shape -
// `MemberExpression { property: PrivateIdentifier, computed: false }`. Member-meta construction
// has an early-return on PrivateIdentifier (documented in unplugin handler) - polyfill bypassed correctly
class Container {
  static #map = new _Map([[1, 'a']]);
  #set = new _Set([10, 20, 30]);
  static getStaticVal() {
    return Container.#map.get(1);
  }
  getInstanceVal() {
    return this.#set.values().next();
  }
}
new Container();