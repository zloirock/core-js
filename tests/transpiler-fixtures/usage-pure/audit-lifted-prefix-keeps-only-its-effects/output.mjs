import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Discarded receiver prefixes preserve their observable effects once.
// Effect-free reads need no replay; prefixes kept inside a live expression retain their source order.
function eff() {}
function eff2() {}
let a, b, c, d, e;
a = _Map;
eff();
b = _Set;
eff();
c = _WeakMap;
eff(), eff2();
d = _WeakSet;
e = _Promise;
eff();
var f = _Map;
var {
  other
} = _globalThis;
var {
  Array: {
    from: g
  }
} = (0, eff(), {
  Array: {
    from: _Array$from
  }
});
const [{
  Array: {
    of: h
  }
}] = [(0, eff(), {
  Array: {
    of: _Array$of
  }
})];
if (1) {
  eff();
  var i = _Set;
  var {
    alsoOther
  } = _globalThis;
}
for (var j = (eff(), _WeakSet), {
    moreOther
  } = _globalThis, n = 0; n < 1; n++);
export const r = [a, b, c, d, e, f, other, g, h, i, alsoOther, j, moreOther];