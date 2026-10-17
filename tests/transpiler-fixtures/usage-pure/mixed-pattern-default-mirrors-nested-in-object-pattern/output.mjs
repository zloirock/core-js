import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map";
export const nestedInObjectPattern = (({
  p: {
    Map: M3,
    Array: {
      from: from3
    }
  } = {
    Map: _Map,
    Array: {
      from: _Array$from
    }
  }
}) => [M3, from3])({});