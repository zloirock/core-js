import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// An anonymous object's `this.<field>` flow is sound to narrow ONLY while the object stays module-local.
// When its value is carried out through a CONTAINER whose own value escapes - here an array element handed
// to a `return` - an external holder can reassign the field, so the narrow must drop to the generic helper
// (`this.data.at` -> `_at`). An array that stays local (bound to a const, never escaping) keeps the
// per-element narrow, so its `this.data.includes` resolves the array-specific `_includesMaybeArray`.
const cells = [{
  data: ["x"],
  read() {
    var _ref;
    return _includesMaybeArray(_ref = this.data).call(_ref, "y");
  }
}];
function readLocal() {
  return cells[0].read();
}
function escapeViaReturnedArray() {
  return [{
    data: ["y"],
    peek() {
      var _ref2;
      return _at(_ref2 = this.data).call(_ref2, 0);
    }
  }];
}
export { readLocal, escapeViaReturnedArray };