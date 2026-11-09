import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A nested slot default keeps the static receiver, including the method used by its instance read.
function read({
  from: {
    name
  } = {}
} = {
  from: {
    name: _nameMaybeFunction(_Array$from)
  }
}) {
  return name;
}
read();