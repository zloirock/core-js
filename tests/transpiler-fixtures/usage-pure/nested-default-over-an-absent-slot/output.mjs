import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// a nested pattern level's default is the receiver alone where the init's literal provably leaves the
// slot undefined - an absent key, a slot past an array's end, a `void` one - so only the default's
// family is owed; a slot something may still supply - a value, an inherited key, a spread - keeps both
function list() {
  return [1, 2];
}
const {
  A: {
    at
  } = {
    at: _atMaybeArray(list())
  }
} = {};
const [{
  map
} = {
  map: _mapMaybeArray(list())
}] = [];
const {
  A: {
    filter
  } = {
    filter: _filterMaybeArray(list())
  }
} = {
  A: void 0
};
const {
  A: {
    find
  } = {
    find: _findMaybeArray(list())
  }
} = {
  A: source
};
const {
  toString: {
    some
  } = list()
} = {};
const {
  A: {
    every
  } = list()
} = {
  ...rest
};
use(at, map, filter, find, some, every);