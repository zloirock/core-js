// class private field with type annotation: `this.#raw` property access resolves through
// the declared field type. separate from the private-getter path (the class-member resolver
// routes a private field to the property branch, not the method branch)
class Holder<T extends number> {
  #raw: T[] = [] as T[];
  last(): T | undefined { return this.#raw.at(-1); }
}
new Holder<number>().last();
