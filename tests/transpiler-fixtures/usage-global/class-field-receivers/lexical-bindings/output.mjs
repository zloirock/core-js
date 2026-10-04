import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// Receiver capture in an instance field keeps the field's enclosing lexical environment.
// this and super select this instance; new.target keeps its field-initializer value.
class Base {
  get data() {
    return [1, [2]];
  }
}
export class Box extends Base {
  value = this.data.at(0);
  found = super.data.includes(1);
  flattened = (new.target?.data || this.data).flat();
}