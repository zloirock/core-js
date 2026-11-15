import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A read outside the local function frame keeps its conservative type on repeated queries.
export function read(flag) {
  let value = [1];
  if (flag) value = [2];
  try {
    return _atMaybeArray(value).call(value, -1);
  } catch (error) {
    return _nameMaybeFunction(error);
  }
}