let reassigned = { Base: WeakMap };
reassigned = { Base: Promise };
class OverReaching extends reassigned.Base {
  static attempted() { return super.try(() => 4); }
}
export { OverReaching };
