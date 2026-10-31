import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// An undecided Array/Iterator selection serves `from` for each arm. A plain sibling follows the
// selected receiver; pure Iterator retains the existing pure-constructor whole-swap boundary rather
// than reading the ambient constructor object.
export function read(flag) {
  const {
    from,
    custom
  } = flag ? {
    from: _Array$from,
    custom: Array.custom
  } : {
    from: _Iterator$from,
    custom: _Iterator.custom
  };
  return [from, custom];
}