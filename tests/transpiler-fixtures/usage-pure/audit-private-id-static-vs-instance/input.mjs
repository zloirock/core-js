// PrivateIdentifier in static and instance context. Both parsers emit identical shape -
// `MemberExpression { property: PrivateIdentifier, computed: false }`. buildMemberMeta
// has early-return on PrivateIdentifier (per §4 unplugin) - polyfill bypassed correctly
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
