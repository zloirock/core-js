import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const log = [];
{
  (x => (_pushMaybeArray(log).call(log, 'x'), x))(Array);
  const f = _Array$from;
}