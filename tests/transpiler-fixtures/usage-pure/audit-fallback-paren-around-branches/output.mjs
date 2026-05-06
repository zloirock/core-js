import _Set from "@core-js/pure/actual/set/constructor";
import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// `cond ? (Array) : (Iterator)` - parens preserved around each branch identifier.
// Per-branch viability check peels parens and TS wrappers so each branch identifier
// reaches the receiver classifier and contributes its polyfill independently
export const {
  from: a
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
};
export const {
  values: b
} = Array || _Set;