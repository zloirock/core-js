import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Quoted siblings retain native reads in the mirrored realm branch; supplied objects stay native.
// Resolved computed strings use the same literal keys. An unquoted numeric key still declines.
const {
  Array: {
    from
  },
  "with-dash": w
} = c ? {
  Array: {
    from: _Array$from
  },
  "with-dash": _globalThis["with-dash"]
} : userObj;
export const r = from([1]);
export const r2 = w;

// A computed key resolving to a quoted name mirrors the same branch.
const dash = "a-b";
const {
  Map: {
    groupBy
  },
  [dash]: v
} = c2 ? {
  Map: {
    groupBy: _Map$groupBy
  },
  "a-b": _globalThis["a-b"]
} : otherObj;
export const r3 = groupBy;
export const r4 = v;

// An unquoted numeric key keeps the existing native branch.
const {
  Set: {
    union
  },
  0: zero
} = c3 ? _globalThis : thirdObj;
export const r5 = union;
export const r6 = zero;