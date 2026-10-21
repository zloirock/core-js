import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
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
}] = [(0, eff(), _globalThis)];
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