import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// the param-default / IIFE-arg instance synth types its receiver off the PEELED path, so a TS cast
// on the receiver cannot force a type-specific instance helper onto a value of another runtime type
function f({
  at
} = {
  at: _at(x)
} as string) {
  return at;
}
const g = (({
  includes
}) => includes)({
  includes: _includes(y)
} as string);
export { f, g };