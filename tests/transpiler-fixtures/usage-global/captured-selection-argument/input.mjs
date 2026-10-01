// The argument receives the original object after the destructured static is assigned.
export function read(shim, consume) {
  let assign;
  return consume({ assign } = shim || Object, assign);
}
