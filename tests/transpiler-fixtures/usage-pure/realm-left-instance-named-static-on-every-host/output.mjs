import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$values from "@core-js/pure/actual/object/values";
import _Symbol$match from "@core-js/pure/actual/symbol/match";
import _Symbol$replace from "@core-js/pure/actual/symbol/replace";
import _Symbol$search from "@core-js/pure/actual/symbol/search";
import _Symbol$split from "@core-js/pure/actual/symbol/split";
// A `||` left read off the realm of a global the build does not serve leaves its right live on every
// destructuring host, and a key naming both an instance method and a static of the right's constructor
// takes the static's own entry on that arm: an assignment, a member target, a parameter default and its
// inner default, a call argument, an exported declaration and a leaf default.
let concat;
({
  concat
} = _globalThis.WeakRef || {
  concat: _Iterator$concat
});
const target = {};
({
  entries: target.entries
} = _globalThis.WeakRef || {
  entries: _Object$entries
});
export function pick({
  values
} = _globalThis.WeakRef || {
  values: _Object$values
}) {
  return values;
}
export function inner({
  deep: {
    match
  } = _globalThis.WeakRef || {
    match: _Symbol$match
  }
} = {}) {
  return match;
}
(({
  replace
}) => use(replace))(_globalThis.WeakRef || {
  replace: _Symbol$replace
});
export const {
  split
} = _globalThis.WeakRef || {
  split: _Symbol$split
};
const {
  search = null
} = _globalThis.WeakRef || {
  search: _Symbol$search
};
export { concat, target, search };