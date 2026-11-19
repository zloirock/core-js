import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Reflect$has from "@core-js/pure/actual/reflect/has";
// The namespace publishes the source bindings while its computed key retains its original position.
const effects = [];
function mark() {
  _pushMaybeArray(effects).call(effects, 'key');
}
namespace Surface {
  var _unused;
  export const {
    0: {
      0: {
        0: {
          value: resolve
        } = {
          value: ({
            globalThis: {
              [(mark(), 'Promise')]: _unused
            } = _Reflect$has(_globalThis, "globalThis") ? void 0 : _globalThis
          } = _globalThis, _Promise$resolve)
        }
      }
    },
    1: {
      Infinity: infinity
    } = _globalThis
  } = {
    0: {
      0: {
        0: void 0
      }
    },
    1: void 0
  };
}
export { Surface, effects };