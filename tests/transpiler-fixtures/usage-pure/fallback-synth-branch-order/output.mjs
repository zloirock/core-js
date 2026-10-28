import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
export function read(pick, nested) {
  const log = [];
  const {
    from,
    of,
    missing = (_pushMaybeArray(log).call(log, 'default'), 9)
  } = (_pushMaybeArray(log).call(log, 'before'), pick
  // The selected leaf registers before its dead right is removed.
  ? nested ? (_pushMaybeArray(log).call(log, 'array'), {
    from: _Array$from,
    of: _Array$of,
    missing: Array.missing
  }) : function (_ref) {
    return {
      from: _Array$from,
      of: _Array$of,
      missing: _ref.missing
    };
  }((() => {
    _pushMaybeArray(log).call(log, 'call');
    return _globalThis.Array;
  })()) : {
    from: value => value,
    of: value => [value]
  });
  return [from([7])[0], of(8)[0], missing, log];
}