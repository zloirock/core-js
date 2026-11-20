import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set/constructor";
// The selection runs first. The later computed key sees the constructor bound by the first property.
for (const {
  Map: M,
  [(use(M), "Set")]: S
} = (flag, {
  Map: _Map,
  "Set": _Set
});;) break;