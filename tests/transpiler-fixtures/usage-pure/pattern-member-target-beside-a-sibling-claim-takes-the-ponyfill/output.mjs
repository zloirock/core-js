import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
// a member target beside a sibling claim takes the ponyfill like the sibling does, whatever its root: the level
// mirrors whole and the pattern writes the ponyfill into the author's own slot
let S, P;
({
  self: {
    Map: sink.m,
    Set: S
  }
} = {
  self: {
    Map: _Map,
    Set: _Set
  }
});
({
  self: {
    Array: {
      from: sink.f
    },
    Promise: P
  }
} = {
  self: {
    Array: {
      from: _Array$from
    },
    Promise: _Promise
  }
});
use(S, P);