import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const log = [];
{
  const f = (idd(Array), _Array$from);
  function idd(x) {
    _pushMaybeArray(log).call(log, x);
    return x;
  }
}