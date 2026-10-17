// The global leg preserves the call while detecting its method.
// Template coercion runs before a missing-method error.
export function read(receiver, argument) {
  return receiver.at(`value:${ argument }`);
}
