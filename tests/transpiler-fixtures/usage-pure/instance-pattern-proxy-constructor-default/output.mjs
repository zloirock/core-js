import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// A constructor navigation used as a parameter default supplies an instance slot.
// The synth runs only for the omitted argument; a caller's own name stays visible.
export function read({
  name
} = {
  name: _nameMaybeFunction(_Symbol)
}) {
  return name;
}
export const supplied = read({
  name: 'caller'
});