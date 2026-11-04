export class Collection {
  static *[Symbol.iterator]() { yield this; }
  static first() { return this[Symbol.iterator]().next().value; }
}
const realm = globalThis;
export function remove() { return delete realm.self.custom; }
