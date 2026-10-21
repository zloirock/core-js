import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Symbol from "@core-js/pure/actual/symbol";
import _URL from "@core-js/pure/actual/url";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live.
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