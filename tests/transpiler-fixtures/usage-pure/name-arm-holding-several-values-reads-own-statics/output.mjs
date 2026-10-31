import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL$canParse from "@core-js/pure/actual/url/can-parse";
import _URL from "@core-js/pure/actual/url/constructor";
// a selection arm that is a name holding several values - a for-of head over a literal, a name a
// selection or a write set - is no constructor the destructure can mirror: it stays as written, spelled
// as the arm or in a container arm's slot, and a static read off it reads the binding pure swapped in, so
// that constructor takes the entry carrying its own statics. a head over built-ins left of a `||` is the
// whole value, its right dead, and is read as the head alone, through its guard. a name holding one value
// is mirrored
for (const M of [_Map, _Set]) {
  const groupBy = M === _Map ? _Map$groupBy : M.groupBy;
  use(groupBy);
}
const P = c ? _Promise : box;
export const {
  try: viaSelected
} = d ? P : Object;
let I = _Iterator;
if (c) I = box;
export const {
  from: viaWritten
} = I || {
  from: _Array$from
};
for (const S of [_Symbol, _Set]) {
  const {
    C: {
      for: viaContainerSlot
    }
  } = c ? {
    C: S
  } : box;
  use(viaContainerSlot);
}
const U = _URL;
export const {
  canParse: viaOne
} = c ? {
  canParse: _URL$canParse
} : box;