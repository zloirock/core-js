import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A field's retained assignment receiver belongs to this instance's initialization.
// Reentry from the computed key cannot replace it with the nested instance's array.
let entered = false;
let calls = 0;
let inner;
let at;
let flat;
function built() {
  return [++calls];
}
function key() {
  if (!entered) {
    entered = true;
    inner = new Reader().result;
  }
  return 'at';
}
class Reader {
  value = {
    [key()]: at,
    flat
  } = built();
  result = [at.call(this.value, 0), flat.call(this.value)[0], this.value[0]];
}
export const result = [new Reader().result, inner, calls];