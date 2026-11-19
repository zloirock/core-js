import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Nested and outer getters keep depth-first source order around a served constructor.
// Later getters observe the initialized binding; earlier ones cannot be moved past it.
const log = [];
const _ref = {
    get before() {
      _pushMaybeArray(log).call(log, 'before');
      return 1;
    },
    get box() {
      _pushMaybeArray(log).call(log, 'box');
      return {
        get first() {
          _pushMaybeArray(log).call(log, 'first');
          return 2;
        },
        get realm() {
          _pushMaybeArray(log).call(log, 'realm');
          return _globalThis;
        },
        get last() {
          _pushMaybeArray(log).call(log, typeof Value);
          return 3;
        }
      };
    },
    get after() {
      _pushMaybeArray(log).call(log, typeof Value);
      return 4;
    }
  },
  {
    before
  } = _ref,
  {
    box: _ref2
  } = _ref,
  {
    first
  } = _ref2,
  {
    realm: _ref3
  } = _ref2,
  Value = _ref3 === _globalThis ? _WeakSet : _ref3.WeakSet,
  {
    last
  } = _ref2,
  {
    after
  } = _ref;
export { before, first, Value, last, after };
export { log };