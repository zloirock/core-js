import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const iterateSelf = _getIteratorMethod(_Symbol);
// Proxy hops anchor on the innermost proxy ponyfill, with a symbol slot beside the static.
// A branch mirror carries that symbol through a computed slot; an unmirrored hop keeps its read.
// A selection whose every arm is the realm collapses, while a test keeps its foreign arm.
/* eslint-disable no-restricted-globals, unicorn/prefer-global-this -- the bare proxy names are the shape under test */
const {
  self: {
    Map: {
      groupBy: viaSelf
    }
  }
} = {
  self: {
    Map: {
      groupBy: _Map$groupBy
    },
    Symbol: _Symbol
  }
};
const iterateRealm = _getIteratorMethod(_Symbol);
const {
  globalThis: {
    Map: {
      groupBy: viaRealm
    }
  }
} = {
  globalThis: {
    Map: {
      groupBy: _Map$groupBy
    },
    Symbol: _Symbol
  }
};
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