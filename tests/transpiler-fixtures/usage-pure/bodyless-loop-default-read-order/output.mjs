import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// A bodyless loop keeps its original statement after each activation's ordered default reads.
const events = [];
const results = [];
for (const [{
  Array: {
    of
  },
  [(_pushMaybeArray(events).call(events, 'key'), 'with-dash')]: dash,
  sibling: first,
  sibling: second
} = {
  Array: {
    of: _Array$of
  },
  get "with-dash"() {
    return _globalThis["with-dash"];
  },
  get sibling() {
    return _globalThis.sibling;
  }
}] of [[], []]) (_pushMaybeArray(results) || 0).call(results, [of(3), dash, first, second]);
use(results, events);