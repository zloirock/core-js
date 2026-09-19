import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// Switch cases can return Map or Set before the Array tail. The retained-body proof leaves
// the switch intact. The local read needs constructor bindings, not their unused statics.
const out = (() => {
  switch (kind) {
    case 'a':
      return _Map;
    case 'b':
      return _Set;
  }
  return Array;
})().from([1]);
export { out };