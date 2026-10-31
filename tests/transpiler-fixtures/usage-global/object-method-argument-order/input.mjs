// The global leg preserves the call while detecting its method.
// Effects inside an object argument precede a missing-method error.
export function read(receiver, argument) {
  return receiver.at({ value: argument() });
}
