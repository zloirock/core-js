import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// trigger host forms beyond plain statements: a for-of HEAD has no init and never
// anchors; while-body / labeled-if bodyless slots keep single-statement renders unbraced;
// a switch-case consequent anchors like any statement slot
for (const {
  Map: {
    customF
  }
} of items) use(customF);
let c1, c2, c3;
while (cond()) ({
  custom: c1
} = _Map);
outer: if (cond) ({
  custom: c2
} = _Promise);
switch (x) {
  case 1:
    ({
      custom: c3
    } = _Iterator);
    break;
}
// a block-scoped statement position with a var binding escaping the block
{
  var {
    custom: c4
  } = _WeakMap;
}
console.log(c1, c2, c3, c4);