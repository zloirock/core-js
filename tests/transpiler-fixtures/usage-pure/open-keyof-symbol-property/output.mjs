import _includes from "@core-js/pure/actual/instance/includes";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// A subtype can add a symbol property with an array value beside a string index signature.
const key = _Symbol('rows');
function read<T extends Record<string, string>>(o: T, k: keyof T) {
  var _ref;
  return _includes(_ref = o[k]).call(_ref, 'a');
}
export const result = read({
  name: 'test',
  [key]: ['ab']
}, key);