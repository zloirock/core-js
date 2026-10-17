import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// The container a `super.<static>` base is read from resolves through the same hops the value canon walks: an alias to the
// container, a member read of it, an effect-wrapped base, and a dominating reassignment whose reaching value is the live
// container.
const mapNs = {
  Base: _Map
};
const viaAlias = mapNs;
class OverAlias extends viaAlias.Base {
  static grouped() {
    return _Map$groupBy.call(this, [1], x => x);
  }
}
export { OverAlias };