// PrivateIdentifier in static and instance context. Both parsers emit identical shape -
// `MemberExpression { property: PrivateIdentifier, computed: false }`. Member-meta construction
// has an early-return on PrivateIdentifier (documented in unplugin handler) - polyfill bypassed correctly
class Container {
  static #map = new Map([[1, 'a']]);
  #set = new Set([10, 20, 30]);

  static getStaticVal() {
    return Container.#map.get(1);
  }
  getInstanceVal() {
    return this.#set.values().next();
  }
}
new Container();
