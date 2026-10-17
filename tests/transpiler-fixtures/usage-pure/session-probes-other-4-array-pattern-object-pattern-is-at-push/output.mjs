import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$is from "@core-js/pure/actual/object/is";
const log = [];
{
  const known = {
    w: Object,
    y: [1]
  };
  const [,] = [known, _pushMaybeArray(log).call(log, 's')];
  const {
    w: {
      is: _unused
    }
  } = known;
  const is = _Object$is;
  const at = _atMaybeArray(known.y);
  [is, at];
}