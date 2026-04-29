// ClassPrivateProperty with type annotation: `this.#raw` property access resolves through
// the declared field type. separate from the private-getter path (findClassMember routes
// ClassPrivateProperty to the property branch of resolveClassMemberNode, not the method branch)
class Holder<T extends number> {
  #raw: T[] = [] as T[];
  last(): T | undefined { return this.#raw.at(-1); }
}
new Holder<number>().last();
