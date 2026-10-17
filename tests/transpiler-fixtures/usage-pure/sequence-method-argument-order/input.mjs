// An argument sequence runs before a missing-method error.
export function read(receiver, argument) {
  return receiver.at((argument(), 0));
}
