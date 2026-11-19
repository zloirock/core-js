import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// Selecting literal containers retain all possible constructor values and native static reads.
// Each stored constructor carries the full surface required by its observed member.
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
  C: _Symbol
};