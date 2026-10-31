const arrayNs = { Base: Array };
let effects = 0;
class OverEffectfulBase extends (effects++, arrayNs.Base) {
  static awaited() { return super.fromAsync([3]); }
}
export { OverEffectfulBase };
export { effects };
