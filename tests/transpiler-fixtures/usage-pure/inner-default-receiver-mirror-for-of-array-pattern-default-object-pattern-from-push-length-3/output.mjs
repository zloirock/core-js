import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An empty loop element and a supplied Array element both reach the supported from default route.
// Native iteration decides which receiver is used on each pass.
const out = [];
for (const [{
  from
} = {
  from: _Array$from
}] of [[], [Array]]) (_pushMaybeArray(out) || 0).call(out, from([1]).length);
export { out };