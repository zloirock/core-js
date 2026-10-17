import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
let assignedName, assignedTwo;
({
  Array: {
    of: {
      name: assignedName,
      length: assignedTwo
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      length: _Array$of.length
    }
  }
});
export { assignedName };
export { assignedTwo };