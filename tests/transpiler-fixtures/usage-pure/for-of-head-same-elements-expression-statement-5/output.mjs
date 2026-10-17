import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Object$is from "@core-js/pure/actual/object/is";
// ... and ahead of the STATICS the host extracted earlier: the source ran the element first
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
const viaEmptiedStatic = _Object$is;
const viaEmptiedStaticAt = _atMaybeArray(known.y);
[viaEmptiedStatic, viaEmptiedStaticAt];
export { viaEmptiedStatic };