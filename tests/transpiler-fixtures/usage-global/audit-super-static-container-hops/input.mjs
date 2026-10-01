// Exported subclasses resolve their bases through aliases, members, effects and reassignment.
// Each exported class requires its base's full static family: Map, Object, Array and Promise.
// This global import set checks those families; it cannot isolate the individual super calls.
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
