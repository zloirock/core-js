// The container a `super.<static>` base is read from resolves through the same hops the value canon walks: an alias to the
// container, a member read of it, an effect-wrapped base, and a dominating reassignment whose reaching value is the live
// container.
const mapNs = { Base: Map };
const viaAlias = mapNs;
class OverAlias extends viaAlias.Base {
  static grouped() { return super.groupBy([1], x => x); }
}
export { OverAlias };
