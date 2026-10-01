import _Array$from from "@core-js/pure/actual/array/from";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// A previously transformed Reflect.apply still identifies the same supplied argument.
// The consumed receiver receives the static polyfill even before the function declaration.
export const result = _Reflect$apply(read, null, [{
  from: _Array$from
}])([7]);
function read({
  from
} = {
  from: _Array$from
}) {
  return from;
}