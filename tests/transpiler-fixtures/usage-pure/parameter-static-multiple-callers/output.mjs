import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set";
// A first caller without the requested static cannot hide a later caller's Array.from.
// Each known caller contributes its selected static independently of earlier receivers.
function read({
  from
}) {
  return from;
}
const First = _Set;
read(First);
export const result = read({
  from: _Array$from
})([7]);