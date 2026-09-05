import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// the container a `super.<static>` base is read from resolves through the same hops the value canon
// walks: an alias to the container, a member read of it, an effect-wrapped base, and a dominating
// reassignment whose reaching value is the live container. the subresolver handed a hop's init back
// verbatim and indexed nothing, and it bailed flat where its super-class sibling kept resolving.
// pure follows the reassigned row too, on proof: the one unconditional write before the class is the
// only container `extends` can have read, so its rewrite drops the receiver with certainty
const mapNs = {
  Base: _Map
};
const viaAlias = mapNs;
class OverAlias extends viaAlias.Base {
  static grouped() {
    return _Map$groupBy.call(this, [1], x => x);
  }
}
const outer = {
  inner: {
    Base: Object
  }
};
const viaMember = outer.inner;
class OverMember extends viaMember.Base {
  static keyed() {
    return _Object$groupBy.call(this, [2], x => x);
  }
}
const arrayNs = {
  Base: Array
};
let effects = 0;
class OverEffectfulBase extends (effects++, arrayNs.Base) {
  static awaited() {
    return _Array$fromAsync.call(this, [3]);
  }
}
let reassigned = {
  Base: _WeakMap
};
reassigned = {
  Base: _Promise
};
class OverReaching extends reassigned.Base {
  static attempted() {
    return _Promise$try.call(this, () => 4);
  }
}
export { OverAlias, OverMember, OverEffectfulBase, OverReaching, effects };