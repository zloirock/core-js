import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A well-known-symbol leaf has no slot the literal can spell, so its hop joins the step as a RAW
// passthrough of the hop's own read, and the step's whole-fit preflight has to model that route or
// it declines the step whose only spelling is the one it refused. The passthrough anchors on the
// innermost PROXY of its key path, through that proxy's own ponyfill: re-reading the step key by
// name off the root would walk the very name the ponyfill exists to supply. The step needs a branch
// worth swapping, which a TEST keeps: a selection every arm of which is the realm drops whole.
/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- the bare proxy names are the shape under test */
const viaSelf = _Map$groupBy;
const iterateSelf = _getIteratorMethod(_Symbol);
const viaRealm = _Map$groupBy;
const iterateRealm = _getIteratorMethod(_Symbol);
export function pickedArm(c) {
  const {
    self: {
      Map: {
        groupBy: armSelf
      },
      Symbol: {
        [_Symbol$iterator]: iterateArm
      }
    }
  } = c ? {
    self: {
      Map: {
        groupBy: _Map$groupBy
      },
      Symbol: _Symbol
    }
  } : {};
  return [armSelf, iterateArm];
}
export { viaSelf, iterateSelf, viaRealm, iterateRealm };