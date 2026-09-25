import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
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
export const grouped = viaPattern.groupBy(src, x => x);