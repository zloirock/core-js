import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// Each computed key runs before its constructor binding, in the for initializer and the unbraced var.
for (const {
  [(e(), "Map")]: M,
  [(e2(), "Set")]: S
} = (c, {
  "Map": _Map,
  "Set": _Set
});;) break;
if (k) var {
  [(e(), "WeakMap")]: W = d,
  zz
} = (c, {
  "WeakMap": _WeakMap,
  get zz() {
    return _globalThis.zz;
  }
});