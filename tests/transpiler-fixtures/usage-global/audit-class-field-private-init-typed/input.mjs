// private fields are scope-closed - external writes can't widen the type, so init shape
// is the source of truth. global-mode parity with pure-mode `audit-class-field-private-*`
export class C {
  #items = [1, 2, 3];
  first() { return this.#items.at(0); }
  flatten() { return this.#items.flat(); }
}
