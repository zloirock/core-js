import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _URL from "@core-js/pure/actual/url";
// every arm of a selection of containers is a constructor the pattern may read a static back off, so
// each one owning the static the pattern names is held - not only the first arm holding a constructor.
// a single container the extraction serves holds nothing
const promises = {
  C: _Promise
};
const maps = {
  C: _Map
};
export const {
  C: {
    groupBy
  }
} = flag ? promises : maps;
export const {
  C: {
    canParse
  }
} = flag ? {
  C: _Iterator
} : other ? {
  C: _URL
} : user;
export const {
  C: {
    for: named
  }
} = {
  C: {
    for: _Symbol$for
  }
};