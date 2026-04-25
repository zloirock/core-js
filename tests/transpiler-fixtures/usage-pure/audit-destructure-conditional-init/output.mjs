import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
// destructuring from a ternary whose branches are different global constructors. per-branch
// synth-swap turns Array branch into `{from: _Array$from}` (Array.from has a viable static
// pure entry); the Promise branch stays raw - Promise.from doesn't exist as static, the
// constructor itself still polyfills via the standard global rewrite
const {
  from
} = cond ? {
  from: _Array$from
} : _Promise;