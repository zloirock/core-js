import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise";
// Bodyless assignments retain their receiver and assignment result.
// Missing pristine constructors use pure bindings; unknown members remain residual reads.
let custom1, custom2, r, g;
if (c1()) ({
  custom: custom1
} = _Map);
if (c2()) ({
  Promise: {
    custom: custom2,
    ...r
  }
} = {
  Promise: _Promise
});
if (c3()) ({
  Iterator: {
    zip: g,
    customI
  }
} = {
  Iterator: {
    zip: _Iterator$zip,
    customI: _Iterator.customI
  }
});
console.log(custom1, custom2, r, g);