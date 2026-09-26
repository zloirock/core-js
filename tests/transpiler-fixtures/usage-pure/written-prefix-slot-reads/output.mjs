import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// a write at a PREFIX of a path stores a new container the rest of the path reads through: a pattern
// read of the rest reaches the constructor the written literal holds
const box = {
  a: {
    N: Math
  }
};
box.a = {
  N: Object
};
const {
  a: {
    N: viaPattern
  }
} = box;
export const grouped = (viaPattern === Object ? _Object$groupBy : viaPattern.groupBy.bind(viaPattern))(src, x => x);