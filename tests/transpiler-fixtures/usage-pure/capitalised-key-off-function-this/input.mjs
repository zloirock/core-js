// A `this` a function binds is the user's object, so a capitalised key off it resolves through that
// object's own type as its lowercase spelling does - read off `this`, off a member of it, from an
// arrow inside the method or in a static method.
export const service = {
  Items: [1, 2],
  Kind: { prototype: [3] },
  newest() {
    const { Items: { findLast } } = this;
    return findLast;
  },
  sample() {
    const { prototype: { toReversed } } = this.Kind;
    return toReversed;
  },
  latest() {
    const read = () => {
      const { Items: { toSorted } } = this;
      return toSorted;
    };
    return read();
  },
};
export class Store {
  static Entries = [4];
  static first() {
    const { Entries: { at } } = this;
    return at;
  }
}
