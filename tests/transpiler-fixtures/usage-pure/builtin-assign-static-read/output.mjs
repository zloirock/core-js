import _Map from "@core-js/pure/actual/map";
import _Object$assign from "@core-js/pure/actual/object/assign";
// Object.assign installs the constructor into a retained slot.
// Its later static read needs the namespace entry.
const w = {
  k: Object
};
_Object$assign(w, {
  k: _Map
});
const result = typeof w.k.groupBy;