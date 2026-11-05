import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A trailing array effect runs before the native Object.is read and captured at leaf.
const log = [];
{
  const known = {
    w: Object,
    y: [1]
  };
  const [,] = [known, _pushMaybeArray(log).call(log, 's')];
  const {
    w: {
      is
    }
  } = known;
  const at = _atMaybeArray(known.y);
  [is, at];
}