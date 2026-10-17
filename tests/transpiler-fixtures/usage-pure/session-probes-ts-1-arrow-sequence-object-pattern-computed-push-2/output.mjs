import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const k = 'k';
const arr = [1, 2];
const log = [];
{
  const k = <T,>(tag: T): T => ((_pushMaybeArray(log) || 0).call(log, String(tag)), tag);
  const a = (k<string>('at'), _atMaybeArray(arr));
}