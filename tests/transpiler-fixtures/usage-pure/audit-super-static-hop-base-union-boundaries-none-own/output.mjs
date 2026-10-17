let noneNs = {
  Base: Boolean
};
if (c) noneNs = {
  Base: Number
};
class NoneOwn extends noneNs.Base {
  static go() {
    return super.from('ab');
  }
}
export { NoneOwn };