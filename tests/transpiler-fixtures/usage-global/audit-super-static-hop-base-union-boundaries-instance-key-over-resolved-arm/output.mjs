let resolvedNs = {
  Base: Boolean
};
if (c) resolvedNs = {
  Base: Array
};
class InstanceKeyOverResolvedArm extends resolvedNs.Base {
  static go() {
    return super.flat();
  }
}
export { InstanceKeyOverResolvedArm };