import _globalThis from "@core-js/pure/actual/global-this";
// Only the known realm slot is supplied. Native siblings keep their read order
// around the unknown child's key, including when that key throws.
const {
  before,
  globalThis: {
    [unknownKey()]: {
      prototype
    }
  },
  after
} = (_ref => {
  return {
    get before() {
      return _ref.before;
    },
    globalThis: _globalThis,
    get after() {
      return _ref.after;
    }
  };
})(_globalThis);