import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions. Instance claims retain their own receivers.
const known = {
  w: Object,
  y: [1]
};
const [,] = [known, _pushMaybeArray(log).call(log, 's')];
const {
  w: {
    is: viaEmptiedStatic
  }
} = known;
const viaEmptiedStaticAt = _atMaybeArray(known.y);
[viaEmptiedStatic, viaEmptiedStaticAt];
export { viaEmptiedStatic };