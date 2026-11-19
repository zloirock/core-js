import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _globalThis from "@core-js/pure/actual/global-this";
// Sibling declarators and trailing array elements keep their source evaluation order.
// Static wrapper reads remain native; supported instance captures stay in their original host.
const seen = [];
const eff = t => (_pushMaybeArray(seen).call(seen, t), t);
const xs = [1];
let kw;
const lead = eff('w'),
  [,] = [_globalThis, eff('x')],
  besideLead = _findLastMaybeArray(_globalThis.Array.prototype);
const lead2 = eff('ab'),
  [,] = [_globalThis, eff('ac')],
  besideParen = _atMaybeArray(_globalThis.Array.prototype);
const [[{
  Object: {
    groupBy: nestedSpread
  }
}]] = [[_globalThis, ...xs]];
const [{
  Object: {
    getOwnPropertyDescriptors
  }
}] = [(eff('y'), _globalThis), eff('z')];
let bodylessGb, bodylessZn;
if (lead) [{
  Map: {
    groupBy: bodylessGb
  }
}, bodylessZn] = [kw = (eff('aa'), _globalThis), 7];
let outSpread;
for (const [_ref] = [_globalThis, ...xs], toSorted = _toSortedMaybeArray(_ref.Array.prototype); !outSpread;) outSpread = toSorted;
export { lead, besideLead, lead2, besideParen, nestedSpread, getOwnPropertyDescriptors, bodylessGb, bodylessZn, outSpread, seen, kw };