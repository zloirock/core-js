// the bare-global computed key spelled FIRST in a DECLARED function's param-default pattern: the
// props after it read the same synth literal its own rewrite admits, so the key's POSITION decides
// nothing about who owns them. Taken as a body extract instead, those props bound the polyfill out
// of the caller's reach - sound only while every local call keeps the default.
function f({ [Set]: y, from, of } = Array) {
  return [from, of, y];
}
f();
