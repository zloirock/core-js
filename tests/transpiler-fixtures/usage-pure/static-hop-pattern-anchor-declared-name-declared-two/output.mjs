import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
const {
  Array: {
    of: {
      name: declaredName,
      length: declaredTwo
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      length: _Array$of.length
    }
  }
};
export { declaredName };
export { declaredTwo };