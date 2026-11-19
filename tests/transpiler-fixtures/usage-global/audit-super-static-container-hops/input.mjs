// Exported subclasses resolve their bases through aliases, members, effects and reassignment.
// Each exported class hands its base out: Map and Promise load their whole families, while Object
// and Array, constructors core-js does not polyfill, load the statics their super calls name alone.
const mapNs = { Base: Map };
const viaAlias = mapNs;
class OverAlias extends viaAlias.Base {
  static grouped() { return super.groupBy([1], x => x); }
}

const outer = { inner: { Base: Object } };
const viaMember = outer.inner;
class OverMember extends viaMember.Base {
  static keyed() { return super.groupBy([2], x => x); }
}

const arrayNs = { Base: Array };
let effects = 0;
class OverEffectfulBase extends (effects++, arrayNs.Base) {
  static awaited() { return super.fromAsync([3]); }
}

let reassigned = { Base: WeakMap };
reassigned = { Base: Promise };
class OverReaching extends reassigned.Base {
  static attempted() { return super.try(() => 4); }
}

export { OverAlias, OverMember, OverEffectfulBase, OverReaching, effects };
