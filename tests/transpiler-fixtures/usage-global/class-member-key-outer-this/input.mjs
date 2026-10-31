// Computed class member keys use the enclosing this; values use the class receiver.
class C {
  [this.Symbol.iterator]() { return this; }
  [this.Array.from([1])[0]] = this;
  static [this.Object.assign({}, { key: 'value' }).key] = this;
}
