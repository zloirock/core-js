import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
var _ref, _ref3;
// A store keeps the realm selection whole, so where the selection may yield the user's object no mirror may
// replace its realm arm: a nested static under it reads the captured hop through the identity guard - the
// ponyfill where the hop is the realm's constructor, the user's own slot where it is not - on an assignment
// and a declaration, through a ternary, `||` and `??`, the store inside parens or behind a sequence prefix.
let held, from, fromEntries;
({
  Array: _ref
} = held = c ? _globalThis : shim), from = _ref === Array ? _Array$from : _ref.from;
const {
    Array: _ref2
  } = held = shim || _globalThis,
  of = _ref2 === Array ? _Array$of : _ref2.of;
({
  Object: _ref3
} = (log(), held = shim ?? _globalThis)), fromEntries = _ref3 === Object ? _Object$fromEntries : _ref3.fromEntries;
// the guard tests a constructor core-js leaves native; one it ships whole keeps the source read
let groupBy;
({
  Map: {
    groupBy
  }
} = held = c ? _globalThis : shim);
export { held, from, of, fromEntries, groupBy };