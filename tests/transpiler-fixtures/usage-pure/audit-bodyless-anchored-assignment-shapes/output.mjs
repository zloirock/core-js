import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map from "@core-js/pure/actual/map/constructor";
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let custom1, custom2, r, g;
if (c1()) ({
  custom: custom1
} = _Map);
if (c2()) ({
  Promise: {
    custom: custom2,
    ...r
  }
} = _globalThis);
if (c3()) {
  ({
    customI
  } = _Iterator);
  g = _Iterator$zip;
}
console.log(custom1, custom2, r, g);