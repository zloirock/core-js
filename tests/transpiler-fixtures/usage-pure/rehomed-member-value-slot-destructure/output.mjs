import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Set from "@core-js/pure/actual/set/constructor";
// a slot written with a member of another container (`box.k = NS.inner`) holds what that container
// holds there: a nested pattern reading through the slot reaches the written constructor beside the
// literal's own, and usage-global injects the static for each
const NS = {
  inner: {
    A: _Map
  }
};
const box = {
  k: {
    A: _Set
  }
};
box.k = NS.inner;
const {
  k: {
    A
  }
} = box;
(A === _Map ? _Map$groupBy : A.groupBy.bind(A))(src, fn);