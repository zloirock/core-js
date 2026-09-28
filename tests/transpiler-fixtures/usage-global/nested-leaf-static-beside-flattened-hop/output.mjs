import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
// a static beside an instance claim in one nested leaf whose hop the flatten moves out of its host:
// the static keeps its own extraction wherever the leaf's twin lands - past the host's last sibling,
// as the host's last or first declarator - never an emptied twin pattern with the binding unassigned
const W = {
  w: Array,
  k: 1
};
let {
  k,
  w: {
    name: splitName,
    from: splitFrom
  }
} = W;
let q = 1,
  {
    w: {
      name: lastName,
      from: lastFrom
    }
  } = W;
let {
    w: {
      name: firstName,
      from: firstFrom
    }
  } = W,
  q2 = 2;
export { k, splitName, splitFrom, q, lastName, lastFrom, firstName, firstFrom, q2 };