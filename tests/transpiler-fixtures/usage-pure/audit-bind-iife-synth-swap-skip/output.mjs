import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// The direct function literal's parameter receives the methods through bind/call.
// Mirror the argument while keeping the original invocation and parameter pattern.
(function ({
  from
}) {
  return from([1, 2]);
}).bind(null)({
  from: _Array$from
});
(function ({
  keys
}) {
  return keys({
    a: 1
  });
}).call(null, {
  keys: _Object$keys
});