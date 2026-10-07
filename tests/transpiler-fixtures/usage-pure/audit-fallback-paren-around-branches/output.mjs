import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// `cond ? (Array) : (Iterator)` - parens preserved around each branch identifier.
// Per-branch viability check peels parens and TS wrappers so each branch identifier
// reaches the receiver classifier and contributes its polyfill independently - the
// paren-wrapped right of a `||` whose left decides nothing too; `Array || (Set)` folds
export const {
  from: a
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
};
export const {
  values: b
} = Array;
export const {
  isInteger: c
} = _globalThis.WeakRef || {
  isInteger: _Number$isInteger
};