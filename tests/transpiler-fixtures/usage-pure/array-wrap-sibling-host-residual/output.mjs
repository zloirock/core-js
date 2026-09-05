import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$getOwnPropertyDescriptors from "@core-js/pure/actual/object/get-own-property-descriptors";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a SIBLING-declarator host keeps the wrapper a trailing neighbour holds alive for a reading claim:
// the residual stays comma-joined between its siblings (a lift would carry the neighbour over the
// leading sibling's own effect), and the dispatch reads the surface inline beside it. a spread
// buried one wrapper level down keeps its wrapper the same way, a parenthesized init reads like
// the bare one, and a bodyless assignment slot braces around the raw destructure and its overwrite
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const lead = eff('w'),
  [{}] = [_globalThis, eff('x')],
  besideLead = _findLastMaybeArray(_globalThis.Array.prototype);
const lead2 = eff('ab'),
  [{}] = [_globalThis, eff('ac')],
  besideParen = _atMaybeArray(_globalThis.Array.prototype);
const nestedSpread = _Object$groupBy;
const [[{
  Object: {
    groupBy: _unused
  }
}]] = [[_globalThis, ...xs]];
eff('y');
eff('z');
const getOwnPropertyDescriptors = _Object$getOwnPropertyDescriptors;
let bodylessGb, bodylessZn;
if (lead) {
  [{
    Map: {
      groupBy: bodylessGb
    }
  }, bodylessZn] = [kw = (eff('aa'), _globalThis), 7];
  bodylessGb = _Map$groupBy;
}
let outSpread;
for (const [_ref] = [_globalThis, ...xs], toSorted = _toSortedMaybeArray(_ref.Array.prototype); !outSpread;) outSpread = toSorted;
export { lead, besideLead, lead2, besideParen, nestedSpread, getOwnPropertyDescriptors, bodylessGb, bodylessZn, outSpread, seen, kw };