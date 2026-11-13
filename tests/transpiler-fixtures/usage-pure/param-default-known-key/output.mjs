import _at from "@core-js/pure/actual/instance/at";
// A proven non-colliding string key retains its read beside the method extraction.
const key = 'length';
export function read(_ref = [7]) {
  let at = _at(_ref);
  let {
    ["length"]: other
  } = _ref;
  return [at, other];
}