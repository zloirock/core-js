import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Each literal element supplies its own static; the custom element and head names survive.
export function read() {
  const seen = [];
  for (var {
    from
  } of [{
    from: _Array$from
  }, {
    from: 'mine'
  }]) _pushMaybeArray(seen).call(seen, typeof from);
  for (let {
    from
  } of [{
    from: 'first'
  }, {
    from: _Array$from
  }]) _pushMaybeArray(seen).call(seen, typeof from);
  for (const {
    from
  } of [{
    from: _Array$from
  }, {
    from: undefined
  }]) _pushMaybeArray(seen).call(seen, typeof from);
  return seen;
}