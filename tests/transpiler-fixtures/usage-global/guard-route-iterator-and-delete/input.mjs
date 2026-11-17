// A class iterator call keeps its class receiver; deleting a realm property preserves the member target.
export class Collection {
  static *[Symbol.iterator]() { yield this; }
  static first() { return this[Symbol.iterator]().next().value; }
}
const realm = globalThis;
export function remove() { return delete realm.self.custom; }
