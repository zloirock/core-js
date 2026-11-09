import _Promise from "@core-js/pure/actual/promise";
// A constructor bound by a parameter remains a native receiver in the body.
function read({
  Promise: P
} = {
  Promise: _Promise
}) {
  return P.resolve(1);
}
read();