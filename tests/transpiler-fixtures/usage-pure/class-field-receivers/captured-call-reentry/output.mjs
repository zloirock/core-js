import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
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
  value = (() => {
    var _ref;
    return _ref = built(), null == _ref ? _ref[""] : (key(), at = _atMaybeArray(_ref)), flat = _flatMaybeArray(_ref), _ref;
  })();
  result = [at.call(this.value, 0), flat.call(this.value)[0], this.value[0]];
}
export const result = [new Reader().result, inner, calls];