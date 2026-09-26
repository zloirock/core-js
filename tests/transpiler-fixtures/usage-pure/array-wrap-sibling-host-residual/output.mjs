import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$getOwnPropertyDescriptors from "@core-js/pure/actual/object/get-own-property-descriptors";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A sibling declarator keeps its order around a captured literal element and its trailing
// neighbour. A nested spread keeps its native wrapper, a parenthesized initializer reads like
// the bare one, and a bodyless assignment remains inside its conditional branch.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const lead = eff('w'),
  [_ref] = [_globalThis, eff('x')],
  besideLead = _findLastMaybeArray(_ref.Array.prototype);
const lead2 = eff('ab'),
  [_ref2] = [_globalThis, eff('ac')],
  besideParen = _atMaybeArray(_ref2.Array.prototype);
const [[{
  Object: {
    groupBy: nestedSpread
  }
}]] = [[{
  Object: {
    groupBy: _Object$groupBy
  }
}, ...xs]];
const [{
  Object: {
    getOwnPropertyDescriptors
  }
}] = [(eff('y'), {
  Object: {
    getOwnPropertyDescriptors: _Object$getOwnPropertyDescriptors
  }
}), eff('z')];
let bodylessGb, bodylessZn;
if (lead) [{
  Map: {
    groupBy: bodylessGb
  }
}, bodylessZn] = [(kw = (eff('aa'), _globalThis), {
  Map: {
    groupBy: _Map$groupBy
  }
}), 7];
let outSpread;
for (const [_ref3] = [_globalThis, ...xs], toSorted = _toSortedMaybeArray(_ref3.Array.prototype); !outSpread;) outSpread = toSorted;
export { lead, besideLead, lead2, besideParen, nestedSpread, getOwnPropertyDescriptors, bodylessGb, bodylessZn, outSpread, seen, kw };