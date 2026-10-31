import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _self from "@core-js/pure/actual/self";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _Symbol$match from "@core-js/pure/actual/symbol/match";
import _Symbol$matchAll from "@core-js/pure/actual/symbol/match-all";
import _Symbol$split from "@core-js/pure/actual/symbol/split";
// A key naming both an instance method and a static of the right's constructor: a `||` / `??` left read
// off the realm of a global the build does not serve - directly, under another realm name, through an
// alias or a destructured binding - leaves the right live, and that arm takes the static's own entry,
// beside a sibling static too.
const {
  concat
} = _globalThis.WeakRef || {
  concat: _Iterator$concat
};
const {
  entries
} = _globalThis.FinalizationRegistry ?? {
  entries: _Object$entries
};
const {
  split
} = _self.WeakRef || {
  split: _Symbol$split
};
const Ref = _globalThis.WeakRef;
const {
  values
} = Ref || {
  values: _Object$values
};
const {
  FinalizationRegistry: Registry
} = _globalThis;
const {
  match
} = Registry ?? {
  match: _Symbol$match
};
const {
  matchAll,
  for: forKey
} = _globalThis.WeakRef || {
  matchAll: _Symbol$matchAll,
  for: _Symbol$for
};
export { concat, entries, split, values, match, matchAll, forKey };