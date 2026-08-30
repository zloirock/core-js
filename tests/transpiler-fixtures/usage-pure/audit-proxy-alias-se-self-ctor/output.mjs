import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A const-aliased proxy-global whole-CONSTRUCTOR receiver behind a side-effect prefix AND a
// redundant `.self` hop: the alias-aware leaf lookup must recognise the Map constructor so the
// receiver resolves to the pure `_Map`, instead of the proxy-root fallback collapsing
// `g.self.Map` -> `g.Map` and colliding with the whole-constructor `_Map` rewrite.
// combines SE-prefix, alias-root, and `.self` hop cases into one receiver.
function effect() {
  return 0;
}
const g = _globalThis;
effect();
const groupBy = _Map$groupBy;
const {
  groupBy: _unused,
  ...rest
} = _Map;
groupBy([], item => item);