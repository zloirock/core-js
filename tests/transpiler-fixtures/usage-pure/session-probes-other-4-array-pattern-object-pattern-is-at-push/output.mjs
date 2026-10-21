import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
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