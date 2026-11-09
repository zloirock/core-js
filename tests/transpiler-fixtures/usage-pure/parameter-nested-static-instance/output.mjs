import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A nested instance read keeps the outer static before the default parameter is mirrored.
function read({
  Array: {
    of: {
      name
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
}) {
  return name;
}
read();