// A guarded realm read retains its method receiver and the argument's nested claim.
// A seal ends the short-circuit without detaching the method reference.
export function open() {
  return globalThis.window?.self.guardTailBox.read?.(Array.of(3)[0]).value;
}
export function sealed() {
  return (globalThis.window?.self.guardTailBox.read)(Array.of(3)[0]).value;
}
