import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A mutated `self` lives in its OWN fixture: the mutation pre-pass marks the name mutated for the
// WHOLE file, so every `.self` hop here stops being the pristine realm-local self-reference and the
// collapse machinery must stand down file-wide - mixing these rows into a pristine-hop fixture
// silently rewrites what every other row locks.
_globalThis.self = {
  self: {
    Array: {
      prototype: {
        flat: _flatMaybeArray([])
      }
    }
  }
};

// The dead-hop descent must NOT skip past a mutated hop: the leaf-nearest anchor stands and the
// mutated value is read through the memo.
let ms;
export const mutatedSelfHop = null == (_ref = (ms = _globalThis.window)?.self) ? void 0 : _flatMaybeArray(_ref.self.Array.prototype).call([3, [4]]);

// An unguarded kept root over the mutated hop keeps the hop too.
let mu;
export const mutatedUnguarded = _flatMaybeArray((mu = _globalThis.window).self.self.Array.prototype).call([5, [6]]);

// NEGATIVE: a 'self'-spelled hop on a NON-proxy object is no proxy hop at all - stays verbatim.
const selfBox = {
  self: {
    self: {
      Array
    }
  }
};
export const plainSelfKey = selfBox.self?.self?.Array.of(4);