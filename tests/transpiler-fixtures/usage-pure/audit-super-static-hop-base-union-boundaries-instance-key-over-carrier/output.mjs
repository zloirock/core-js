let carriedNs;
switch (c) {
  case 1:
    carriedNs = {
      Base: Boolean
    };
    break;
  default:
    carriedNs = {
      Base: Array
    };
}
class InstanceKeyOverCarrier extends carriedNs.Base {
  static go() {
    return super.at(0);
  }
}
export { InstanceKeyOverCarrier };