import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// NEGATIVE: an array-wrapper host the shared array plan declines keeps its native pattern on both
// legs - a static beside an unknown key, or reached through an opaque element, stays unextracted
// even where the same leaf without the wrapper extracts (the flat rows below)
const e = [{
  w: Array
}];
let kx = String('zz');
const [{
  of: wrappedOf,
  [kx]: wrappedUnknown
}] = [Array];
let assignedOf, assignedFrom;
[{
  w: {
    of: assignedOf,
    from: assignedFrom
  }
}] = [e[0]];
const flatOf = _Array$of;
const {
  [kx]: flatUnknown
} = Array;
const flatFrom = _Array$from;
export { wrappedOf, wrappedUnknown, assignedOf, assignedFrom, flatOf, flatUnknown, flatFrom };