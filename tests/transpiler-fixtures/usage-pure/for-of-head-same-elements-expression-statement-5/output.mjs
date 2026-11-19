import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A known literal container keeps its native Object.is read beside an instance at capture.
// The trailing array effect runs before either property binds.
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