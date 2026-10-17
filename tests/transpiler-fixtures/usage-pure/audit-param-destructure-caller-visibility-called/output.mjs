import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// Rewriting a parameter destructure is caller-lossy: a body-extract ignores what the caller passed, and an inline default fills a
// leaf the caller deliberately left undefined.
const G = _globalThis;
const assignedThenCalled = ([{
  Set: S,
  Array: {
    of: o
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => [S, o];
export const called = assignedThenCalled([]);