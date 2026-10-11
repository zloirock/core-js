import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// the fallback a for-of head over built-ins leaves dead is dead for every host reading it - a declaration's
// or an assignment's pattern, a parameter default, a container a pattern reads its slot off, an alias holding
// the selection - so none of them mirrors or reads anything for the right; a sole element reads its static
for (const M of [_Map]) {
  const groupBy = _Map$groupBy;
  use(groupBy);
}
let pick;
for (const S of [_Set, Array]) {
  ({
    fromEntries: pick
  } = S);
  use(pick);
}
for (const P of [_Promise, Array]) {
  const read = ({
    hasOwn
  } = P) => hasOwn;
  use(read());
}
for (const I of [_Iterator, Array]) {
  const {
    W: {
      is
    }
  } = {
    W: I
  };
  use(is);
}
for (const A of [_Map, _Set]) {
  const held = A;
  use(held.assign);
}