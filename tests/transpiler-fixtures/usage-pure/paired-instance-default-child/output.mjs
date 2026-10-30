import _Array$from from "@core-js/pure/actual/array/from";
import _includes from "@core-js/pure/actual/instance/includes";
// A parameter default keeps its child static read.
// The instance dispatch must still use the supplied or defaulted receiver.
export function read(_ref = {
  k: _Array$from([4, 9])
}) {
  let includes = _includes(_ref.k);
  return includes;
}