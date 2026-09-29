import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
// A `this` a function binds is the user's object, so a capitalised key off it resolves through that
// object's own type as its lowercase spelling does - read off `this`, off a member of it, from an
// arrow inside the method or in a static method.
export const service = {
  Items: [1, 2],
  Kind: {
    prototype: [3]
  },
  newest() {
    const findLast = _findLastMaybeArray(this.Items);
    return findLast;
  },
  sample() {
    const toReversed = _toReversedMaybeArray(this.Kind.prototype);
    return toReversed;
  },
  latest() {
    const read = () => {
      const toSorted = _toSortedMaybeArray(this.Items);
      return toSorted;
    };
    return read();
  }
};
export class Store {
  static Entries = [4];
  static first() {
    const at = _at(this.Entries);
    return at;
  }
}