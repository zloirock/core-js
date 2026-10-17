import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// A constructor navigation used as a parameter default supplies an instance slot.
// The synth runs only for the omitted argument; a caller's own name stays visible.
export function read(_ref = _Symbol) {
  let name = _nameMaybeFunction(_ref);
  return name;
}
export const supplied = read({
  name: 'caller'
});