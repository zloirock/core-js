// `this.X?.()` in a static method of a subclass of Array resolves through the same
// inherited-static machinery as `super.X?.()` (`this` in static context is the constructor):
// the polyfill is always defined, so the optional call DEOPTIMIZES (`_Array$from.call(this, ...)`,
// no `null ==` guard) and the trailing instance polys wrap the result - even with TWO trailing
// polys, where the chain-combine would otherwise take over and strand the static un-polyfilled
class C extends Array {
  static make() {
    return this.from?.([1, 2]).flat().at(0);
  }
}
export const r = C.make();
