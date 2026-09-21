import _Map from "@core-js/pure/actual/map";
// A captured container keeps its identity, but its slots remain mutable.
// Pure leaves the nested read native; Map's namespace supplies its own static.
const inner = {
  k: Object
};
const wrapper = {
  part: inner
};
inner.k = _Map;
const {
  part: {
    k: {
      groupBy
    }
  }
} = wrapper;
use(groupBy([1], x => x));