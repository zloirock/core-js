import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// ClassPrivateProperty with type annotation: `this.#raw` property access resolves through
// the declared field type. separate from the private-getter path (findClassMember routes
// ClassPrivateProperty to the property branch of resolveClassMemberNode, not the method branch)
class Holder<T extends number> {
  #raw: T[] = [] as T[];
  last(): T | undefined {
    var _ref;
    return _atMaybeArray(_ref = this.#raw).call(_ref, -1);
  }
}
new Holder<number>().last();