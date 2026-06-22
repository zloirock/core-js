import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// An anonymous object inside a CONTAINER is bound to a name through that container, so the object escapes
// iff the BINDING leaks. A binding read only as a member (`local[0].read()`) stays module-local and keeps
// the per-element narrow (`this.data.at` -> `_atMaybeArray`). A binding that is handed out - exported,
// returned, passed - leaks the element, so `this.data.includes` drops to the generic helper (`_includes`).
const local = [{
  data: ["x"],
  read() {
    var _ref;
    return _atMaybeArray(_ref = this.data).call(_ref, 0);
  }
}];
function readElement() {
  return local[0].read();
}
const leaked = [{
  data: ["y"],
  scan() {
    var _ref2;
    return _includes(_ref2 = this.data).call(_ref2, "z");
  }
}];
export { readElement, leaked };