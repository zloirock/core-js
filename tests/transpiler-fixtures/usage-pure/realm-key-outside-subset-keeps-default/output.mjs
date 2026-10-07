import _Array$from from "@core-js/pure/es/array/from";
import _Array$of from "@core-js/pure/es/array/of";
import _globalThis from "@core-js/pure/es/global-this";
import _Iterator$concat from "@core-js/pure/es/iterator/concat";
import _JSON$parse from "@core-js/pure/es/json/parse";
// A realm key naming a built-in the configured subset does not carry (`AsyncIterator` and `URL` in `es`)
// is an unknown slot: an engine lacking it takes the inner default, which keeps its mirror (`from`, `parse`).
// A built-in the subset carries takes its default as dead (`Iterator`); a known global core-js implements
// nothing of (`WeakRef`) may be missing on a target too, and its default keeps its mirror (`of`).
const {
  AsyncIterator: {
    from
  } = {
    from: _Array$from
  }
} = _globalThis;
const {
  URL: {
    parse
  } = {
    parse: _JSON$parse
  }
} = _globalThis;
const {
  Iterator: {
    concat
  } = Array
} = {
  Iterator: {
    concat: _Iterator$concat
  }
};
const {
  WeakRef: {
    of
  } = {
    of: _Array$of
  }
} = _globalThis;
export { from, parse, concat, of };