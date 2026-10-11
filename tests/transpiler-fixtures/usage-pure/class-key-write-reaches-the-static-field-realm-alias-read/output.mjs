import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
// a write in a class key runs before the static field values above it, so a field reading a member off a
// realm alias reads it off what the key stored: pure, holding both values of the alias, guards the read on
// it - the realm's arm takes the pure constructor, the other re-reads the member as written
let g = _globalThis;
export class Grouped {
  static byParity = (g === _globalThis ? _Map : g.Map).groupBy(xs, x => x % 2);
  static [(g = {
    Map: Object
  }, 'k')] = 1;
}