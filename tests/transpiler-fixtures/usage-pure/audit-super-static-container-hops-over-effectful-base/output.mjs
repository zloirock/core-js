import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
const arrayNs = {
  Base: Array
};
let effects = 0;
class OverEffectfulBase extends (effects++, arrayNs.Base) {
  static awaited() {
    return _Array$fromAsync.call(this, [3]);
  }
}
export { OverEffectfulBase };
export { effects };