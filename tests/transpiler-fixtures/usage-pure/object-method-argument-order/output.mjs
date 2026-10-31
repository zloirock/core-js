import _at from "@core-js/pure/actual/instance/at";
// Effects inside an object argument precede a missing-method error.
export function read(receiver, argument) {
  return (_at(receiver) || 0).call(receiver, {
    value: argument()
  });
}