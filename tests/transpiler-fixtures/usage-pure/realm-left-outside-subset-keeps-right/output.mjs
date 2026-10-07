import _Array$from from "@core-js/pure/es/array/from";
import _globalThis from "@core-js/pure/es/global-this";
import _Iterator$concat from "@core-js/pure/es/iterator/concat";
import _JSON$parse from "@core-js/pure/es/json/parse";
// A `||` / `??` left naming a built-in the configured subset does not carry (`AsyncIterator` and `URL` in
// `es`) counts as no built-in: an engine lacking it runs the right, which keeps its mirror (`from`,
// `parse`). A built-in the subset carries still decides the selection (`Iterator.concat`).
const {
  from
} = _globalThis.AsyncIterator || {
  from: _Array$from
};
const {
  parse
} = _globalThis.URL ?? {
  parse: _JSON$parse
};
const concat = _Iterator$concat;
export { from, parse, concat };