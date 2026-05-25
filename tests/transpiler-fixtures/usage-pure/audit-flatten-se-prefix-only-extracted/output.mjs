import _Array$from from "@core-js/pure/actual/array/from";
// nested-proxy flatten lifts SE prefix from EVERY declarator into a statement above
// the rewrite, including non-extracted siblings whose original source stays as-is.
// result: sibling's SE runs twice (lifted + preserved). only extracted declarators
// (whose receiver tail was consumed) should lift their SE prefix
const from = _Array$from;
const y = (sideEffect(), 1);
export { from, y };