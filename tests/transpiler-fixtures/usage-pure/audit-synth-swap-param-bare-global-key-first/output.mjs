import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set/constructor";
// the bare-global computed key spelled FIRST in a DECLARED function's param-default pattern: the
// props after it read the same synth literal its own rewrite admits, so the key's POSITION decides
// nothing about who owns them. Taken as a body extract instead, those props bound the polyfill out
// of the caller's reach - sound only while every local call keeps the default.
function f({
  [_Set]: y,
  from,
  of
} = {
  [_Set]: Array[_Set],
  from: _Array$from,
  of: _Array$of
}) {
  return [from, of, y];
}
f();