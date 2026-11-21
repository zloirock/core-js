import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// A spread can publish the constructors stored on its sources. An inherited slot
// and an own property of the copied object are distinct sources.
const src = {
  M: _Map
};
const copy = {
  ...src
};
copy.M.groupBy(list, fn);
const inline = {
  ...{
    P: _Promise
  }
};
inline.P.try(fn);
const pending = {
  M: _Promise
};
const overridden = {
  ...pending,
  M: Object
};
overridden.M.allSettled(list);
const iterators = {
  I: _Iterator
};
const nested = {
  w: {
    ...iterators
  }
};
nested.w.I.from(list);
const proto = {
  __proto__: {
    A: Array
  }
};
proto.A.of(1);