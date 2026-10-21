import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
function siblingKeepsResidual(hit) {
  const _ref = {
    w: _globalThis,
    z: (hit(), 1)
  };
  const deepBeside = _atMaybeArray(_ref.w.Array.prototype);
  const {
    z: sibZ
  } = _ref;
  const {
      w: {
        Array: {
          prototype: _ref2
        }
      }
    } = {
      w: _globalThis,
      z: (hit(), 2)
    },
    deepAlone = _atMaybeArray(_ref2);
  const _ref3 = {
    w: _globalThis,
    y: (hit(), 3)
  };
  const symBeside = _getIteratorMethod(_ref3.w);
  const {
    y: sibY
  } = _ref3;
  return [deepBeside, sibZ, deepAlone, symBeside, sibY];
}
export default [siblingKeepsResidual(() => 0)];