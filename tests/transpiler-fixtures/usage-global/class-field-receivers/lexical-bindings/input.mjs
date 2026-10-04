// Receiver capture in an instance field keeps the field's enclosing lexical environment.
// this and super select this instance; new.target keeps its field-initializer value.
class Base {
  get data() { return [1, [2]]; }
}
export class Box extends Base {
  value = this.data.at(0);
  found = super.data.includes(1);
  flattened = (new.target?.data || this.data).flat();
}
